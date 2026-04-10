"""
Export all tables from Supabase to local JSON files, then import into local Postgres.

Usage:
    docker compose up db
    datagen/.venv/bin/python data/egress_supabase.py
"""

import json
import os

import psycopg2
from dotenv import load_dotenv
from supabase import create_client

# Load Supabase credentials
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.supabase"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"]

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgres://study:studypass@localhost:5432/scrollstudy"
)
RAW_DIR = os.path.join(os.path.dirname(__file__), "raw")

TABLES = [
    "sessions",
    "demographics",
    "post_views",
    "friction_events",
    "memory_responses",
    "survey_responses",
]


def fetch_all(supabase, table):
    """Fetch all rows from a Supabase table (handles pagination)."""
    rows = []
    page_size = 1000
    offset = 0
    while True:
        resp = supabase.table(table).select("*").range(offset, offset + page_size - 1).execute()
        batch = resp.data
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size
    return rows


def save_json(name, data):
    os.makedirs(RAW_DIR, exist_ok=True)
    path = os.path.join(RAW_DIR, f"{name}.json")
    with open(path, "w") as f:
        json.dump(data, f, default=str)
    print(f"  {name}.json: {len(data)} rows")


def load_json(name):
    with open(os.path.join(RAW_DIR, f"{name}.json")) as f:
        return json.load(f)


def import_to_postgres():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    cur.execute("DELETE FROM sessions")
    conn.commit()
    print("  Cleared existing local data")

    # Sessions
    sessions = load_json("sessions")
    for s in sessions:
        cur.execute(
            """INSERT INTO sessions (id, participant_id, condition, friction_frequency,
                created_at, feed_started_at, feed_ended_at, feed_duration_ms,
                post_count, memory_hit_rate, memory_fa_rate, completed_at, status)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (s["id"], s["participant_id"], s["condition"], s["friction_frequency"],
             s["created_at"], s.get("feed_started_at"), s.get("feed_ended_at"),
             s.get("feed_duration_ms"), s.get("post_count"),
             s.get("memory_hit_rate"), s.get("memory_fa_rate"),
             s.get("completed_at"), s["status"]),
        )
    conn.commit()
    print(f"  sessions: {len(sessions)}")

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
    print(f"  demographics: {len(demos)}")

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
    print(f"  post_views: {len(pvs)}")

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
    print(f"  friction_events: {len(fes)}")

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
    print(f"  memory_responses: {len(mrs)}")

    # Survey responses
    srs = load_json("survey_responses")
    for sr in srs:
        cur.execute(
            """INSERT INTO survey_responses (id, session_id, question_id, value)
            VALUES (%s,%s,%s,%s)""",
            (sr["id"], sr["session_id"], sr["question_id"], sr.get("value")),
        )
    conn.commit()
    print(f"  survey_responses: {len(srs)}")

    cur.close()
    conn.close()


def main():
    print("Connecting to Supabase...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("\nExporting tables to JSON...")
    for table in TABLES:
        data = fetch_all(supabase, table)
        save_json(table, data)

    print("\nImporting into local Postgres...")
    import_to_postgres()

    print("\nDone — full Supabase copy in data/raw/ and local Postgres")


if __name__ == "__main__":
    main()
