/**
 * app.js — ScrollStudy backend entry point
 *
 * Express API that receives telemetry, survey, and memory-test data
 * from the React frontend and writes it to PostgreSQL.
 *
 * Routes
 * ──────
 *  POST   /api/sessions               Create a new session
 *  POST   /api/sessions/:id/events    Batch-upload telemetry events
 *  POST   /api/sessions/:id/memory    Submit memory test responses
 *  POST   /api/sessions/:id/survey    Submit survey responses
 *  POST   /api/sessions/:id/submit    Submit full session bundle
 *  GET    /api/sessions               List all sessions (admin/export)
 *  GET    /api/sessions/:id           Get session details
 *  GET    /health                     Health check
 */

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'pg';
const { Pool } = pkg;

const app  = express();
const PORT = process.env.PORT || 4000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Sessions ──────────────────────────────────────────────────────────────────
app.post('/api/sessions', async (req, res) => {
  const { condition, frictionFrequency, demographics } = req.body;
  const participantId = `P${uuidv4().slice(0, 8).toUpperCase()}`;
  const sessionId     = uuidv4();

  await pool.query(
    `INSERT INTO sessions (id, participant_id, condition, friction_frequency)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, participantId, condition, frictionFrequency ?? null],
  );

  if (demographics) {
    await pool.query(
      `INSERT INTO demographics (session_id, age, gender, social_media_usage, platforms_used)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, demographics.age, demographics.gender,
       demographics.socialMediaUsage, demographics.platformsUsed ?? []],
    );
  }

  res.status(201).json({ sessionId, participantId, condition, frictionFrequency });
});

// ── Events (incremental batch upload) ─────────────────────────────────────────
app.post('/api/sessions/:id/events', async (req, res) => {
  const { id } = req.params;
  const { events = [] } = req.body;

  for (const ev of events) {
    const { type, _ts, ...payload } = ev;
    await pool.query(
      `INSERT INTO events (session_id, type, ts, payload) VALUES ($1, $2, $3, $4)`,
      [id, type, new Date(_ts), payload],
    );

    // Denormalise post_view events into the aggregate table
    if (type === 'post_view') {
      await pool.query(
        `INSERT INTO post_views (session_id, post_id, category, start_ts, end_ts, dwell_ms, scroll_depth)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, payload.postId, payload.category ?? null,
         new Date(payload.startTs), new Date(payload.endTs),
         payload.dwellMs, payload.scrollDepth ?? null],
      );
    }

    // Denormalise friction events
    if (type === 'friction_done') {
      await pool.query(
        `INSERT INTO friction_events (session_id, friction_type, trigger_index, duration_ms, action, shown_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [id, payload.frictionType, payload.triggerPostIndex ?? null,
         payload.durationMs, payload.action ?? null],
      );
    }
  }

  res.json({ inserted: events.length });
});

// ── Memory test ───────────────────────────────────────────────────────────────
app.post('/api/sessions/:id/memory', async (req, res) => {
  const { id } = req.params;
  const { responses = [] } = req.body;

  for (const r of responses) {
    await pool.query(
      `INSERT INTO memory_responses (session_id, post_id, memory_label, participant_answer, correct, rt_ms, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, r.postId, r.memoryLabel, r.participantAnswer, r.correct, r.rtMs, r.category ?? null],
    );
  }

  // Update session-level hit/FA rates
  const hits = responses.filter(r => r.memoryLabel === 'old' && r.correct).length;
  const fas  = responses.filter(r => r.memoryLabel === 'new' && !r.correct).length;
  const oldN = responses.filter(r => r.memoryLabel === 'old').length;
  const newN = responses.filter(r => r.memoryLabel === 'new').length;

  if (oldN > 0 || newN > 0) {
    await pool.query(
      `UPDATE sessions SET memory_hit_rate = $2, memory_fa_rate = $3 WHERE id = $1`,
      [id, oldN ? hits / oldN : null, newN ? fas / newN : null],
    );
  }

  res.json({ inserted: responses.length });
});

// ── Survey ────────────────────────────────────────────────────────────────────
app.post('/api/sessions/:id/survey', async (req, res) => {
  const { id } = req.params;
  const { responses = {} } = req.body;

  for (const [qId, val] of Object.entries(responses)) {
    await pool.query(
      `INSERT INTO survey_responses (session_id, question_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (session_id, question_id) DO UPDATE SET value = EXCLUDED.value`,
      [id, qId, String(val)],
    );
  }

  res.json({ ok: true });
});

// ── Full submit (end of session) ──────────────────────────────────────────────
app.post('/api/sessions/:id/submit', async (req, res) => {
  const { id } = req.params;
  const summary = req.body;

  // Upload any remaining events
  if (summary.rawEvents?.length) {
    for (const ev of summary.rawEvents) {
      const { type, _ts, ...payload } = ev;
      await pool.query(
        `INSERT INTO events (session_id, type, ts, payload) VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [id, type, new Date(_ts || Date.now()), payload],
      ).catch(() => {});
    }
  }

  await pool.query(
    `UPDATE sessions SET
       feed_duration_ms = $2,
       post_count       = $3,
       completed_at     = NOW()
     WHERE id = $1`,
    [id, summary.feedDurationMs, summary.postCount],
  );

  res.json({ ok: true });
});

// ── Admin: list sessions ───────────────────────────────────────────────────────
app.get('/api/sessions', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.*, d.age, d.gender, d.social_media_usage
     FROM sessions s
     LEFT JOIN demographics d ON d.session_id = s.id
     ORDER BY s.created_at DESC`,
  );
  res.json(rows);
});

app.get('/api/sessions/:id', async (req, res) => {
  const { id } = req.params;
  const session = await pool.query('SELECT * FROM sessions WHERE id=$1', [id]);
  const views   = await pool.query('SELECT * FROM post_views WHERE session_id=$1', [id]);
  const friction = await pool.query('SELECT * FROM friction_events WHERE session_id=$1', [id]);
  const memory  = await pool.query('SELECT * FROM memory_responses WHERE session_id=$1', [id]);
  const survey  = await pool.query('SELECT * FROM survey_responses WHERE session_id=$1', [id]);

  res.json({
    session: session.rows[0],
    postViews: views.rows,
    frictionEvents: friction.rows,
    memoryResponses: memory.rows,
    surveyResponses: survey.rows,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`ScrollStudy backend listening on :${PORT}`));

export default app;
