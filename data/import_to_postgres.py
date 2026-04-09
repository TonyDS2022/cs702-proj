"""
Import exported Supabase JSON data into local Postgres.

Usage:
    cd cs702-proj
    docker compose up db  # ensure local Postgres is running
    .venv/bin/python data/import_to_postgres.py
"""

import json
import os

import psycopg2

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgres://study:studypass@localhost:5432/scrollstudy"
)
RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")


def load_json(name):
    with open(os.path.join(RAW_DIR, f"{name}.json")) as f:
        return json.load(f)


def main():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Clear existing data (cascade from sessions)
    cur.execute("DELETE FROM sessions")
    conn.commit()
    print("Cleared existing data")

    # Sessions
    sessions = load_json("sessions")
    for s in sessions:
        cur.execute(
            """INSERT INTO sessions (id, participant_id, condition, friction_frequency,
                created_at, feed_started_at, feed_ended_at, feed_duration_ms,
                post_count, memory_hit_rate, memory_fa_rate, completed_at, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (s["id"], s["participant_id"], s["condition"], s["friction_frequency"],
             s["created_at"], s["feed_started_at"], s["feed_ended_at"], s["feed_duration_ms"],
             s["post_count"], s["memory_hit_rate"], s["memory_fa_rate"],
             s["completed_at"], s["status"]),
        )
    conn.commit()
    print(f"sessions: {len(sessions)}")

    # Demographics
    demos = load_json("demographics")
    for d in demos:
        cur.execute(
            """INSERT INTO demographics (session_id, age, gender, social_media_usage, platforms_used)
            VALUES (%s,%s,%s,%s,%s)""",
            (d["session_id"], d["age"], d["gender"],
             d["social_media_usage"], d["platforms_used"]),
        )
    conn.commit()
    print(f"demographics: {len(demos)}")

    # Post views
    pvs = load_json("post_views")
    for pv in pvs:
        cur.execute(
            """INSERT INTO post_views (id, session_id, post_id, category, start_ts, end_ts, dwell_ms, scroll_depth)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
            (pv["id"], pv["session_id"], pv["post_id"], pv.get("category"),
             pv.get("start_ts"), pv.get("end_ts"), pv["dwell_ms"], pv.get("scroll_depth")),
        )
    conn.commit()
    print(f"post_views: {len(pvs)}")

    # Friction events
    fes = load_json("friction_events")
    for fe in fes:
        cur.execute(
            """INSERT INTO friction_events (id, session_id, friction_type, trigger_index, shown_at, duration_ms, action)
            VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (fe["id"], fe["session_id"], fe["friction_type"], fe.get("trigger_index"),
             fe.get("shown_at"), fe.get("duration_ms"), fe.get("action")),
        )
    conn.commit()
    print(f"friction_events: {len(fes)}")

    # Memory responses
    mrs = load_json("memory_responses")
    for mr in mrs:
        cur.execute(
            """INSERT INTO memory_responses (id, session_id, post_id, memory_label, participant_answer, correct, rt_ms, category)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
            (mr["id"], mr["session_id"], mr["post_id"], mr["memory_label"],
             mr["participant_answer"], mr["correct"], mr.get("rt_ms"), mr.get("category")),
        )
    conn.commit()
    print(f"memory_responses: {len(mrs)}")

    # Survey responses
    srs = load_json("survey_responses")
    for sr in srs:
        cur.execute(
            """INSERT INTO survey_responses (id, session_id, question_id, value)
            VALUES (%s,%s,%s,%s)""",
            (sr["id"], sr["session_id"], sr["question_id"], sr.get("value")),
        )
    conn.commit()
    print(f"survey_responses: {len(srs)}")

    cur.close()
    conn.close()
    print("\nDone — all tables loaded into local Postgres")


if __name__ == "__main__":
    main()
