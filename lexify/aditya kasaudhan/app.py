"""
Lexify backend — Flask REST API
Endpoints:
  GET  /lookup?word=ephemeral        -> definition + AI context (cached)
  POST /save-word                    -> save a word (from app or extension)
  GET  /saved-words                  -> list all saved words
  POST /review                       -> update spaced-repetition score
  GET  /due-reviews                  -> words due for review today
  GET  /history                      -> recent lookups
  GET  /stats                        -> dashboard stats
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, g, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Manual CORS — allows the Chrome extension and any localhost frontend to call this API."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/<path:_any>", methods=["OPTIONS"])
@app.route("/", methods=["OPTIONS"])
def cors_preflight(_any=None):
    return ("", 204)

DB_PATH = os.path.join(os.path.dirname(__file__), "lexify.db")
MERRIAM_KEY = os.getenv("MERRIAM_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")


# ── Database setup ────────────────────────────────────────────────────────

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Cache table — avoids re-hitting Merriam-Webster / Claude for repeat words
    cur.execute("""
        CREATE TABLE IF NOT EXISTS word_cache (
            word        TEXT PRIMARY KEY,
            data        TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # History — every lookup, used for the "Recent" sidebar
    cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            word        TEXT NOT NULL,
            pos         TEXT,
            looked_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Saved words — for spaced repetition / flashcards
    cur.execute("""
        CREATE TABLE IF NOT EXISTS saved_words (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            word         TEXT UNIQUE NOT NULL,
            pos          TEXT,
            definition   TEXT,
            context      TEXT,
            sentence     TEXT,        -- captured sentence (from extension)
            source_url   TEXT,        -- page it was saved from
            source_title TEXT,
            saved_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            -- SM-2 spaced repetition fields
            ease_factor  REAL DEFAULT 2.5,
            interval_days INTEGER DEFAULT 0,
            repetitions  INTEGER DEFAULT 0,
            next_review  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_reviewed TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# ── Helper: Merriam-Webster ─────────────────────────────────────────────────

def fetch_merriam(word: str) -> dict:
    import requests

    if not MERRIAM_KEY:
        return {}

    url = f"https://www.dictionaryapi.com/api/v3/references/collegiate/json/{word}"
    try:
        resp = requests.get(url, params={"key": MERRIAM_KEY}, timeout=5)
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return {}

    if not data or not isinstance(data[0], dict):
        return {}

    entry = data[0]
    short_defs = entry.get("shortdef", [])
    fl = entry.get("fl", "")
    hwi = entry.get("hwi", {})
    prs = hwi.get("prs", [{}])
    phonetic = prs[0].get("mw", "") if prs else ""

    return {
        "definitions": short_defs,
        "pos": fl,
        "phonetic": f"/{phonetic}/" if phonetic else "",
    }


# ── Helper: Claude for context/etymology/synonyms ───────────────────────────

def fetch_ai_context(word: str, dictionary: dict) -> dict:
    if not ANTHROPIC_API_KEY:
        return {}

    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    defs_hint = ""
    if dictionary.get("definitions"):
        defs_hint = f"\nKnown dictionary definitions: {dictionary['definitions']}"

    prompt = f"""For the word "{word}", respond ONLY with valid JSON, no markdown/backticks.{defs_hint}

{{
  "context": "2-3 sentences: when/where/how this word is used in modern English - register, connotations, collocations.",
  "examples": ["A natural sentence using {word}.", "Another sentence in a different context with {word}."],
  "synonyms": ["syn1","syn2","syn3","syn4","syn5"],
  "etymology": "Brief origin: language of origin, original meaning, path into English.",
  "register": "formal | informal | technical | literary | neutral"
}}"""

    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception:
        return {}


# ── Routes ───────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def dashboard():
    return send_from_directory(os.path.dirname(__file__), "static_dashboard.html")


@app.route("/lookup", methods=["GET"])
def lookup():
    word = request.args.get("word", "").strip().lower()
    if not word:
        return jsonify({"error": "Missing 'word' query param"}), 400

    db = get_db()

    # 1. Check cache first
    row = db.execute("SELECT data FROM word_cache WHERE word = ?", (word,)).fetchone()
    if row:
        result = json.loads(row["data"])
    else:
        # 2. Fetch fresh from Merriam-Webster + Claude
        dictionary = fetch_merriam(word)
        ai = fetch_ai_context(word, dictionary)

        result = {
            "word": word,
            "phonetic": dictionary.get("phonetic", ""),
            "pos": dictionary.get("pos", ""),
            "register": ai.get("register", ""),
            "definitions": dictionary.get("definitions") or ["No definition found."],
            "examples": ai.get("examples", []),
            "context": ai.get("context", ""),
            "synonyms": ai.get("synonyms", []),
            "etymology": ai.get("etymology", ""),
        }

        # 3. Cache it
        db.execute(
            "INSERT OR REPLACE INTO word_cache (word, data) VALUES (?, ?)",
            (word, json.dumps(result)),
        )
        db.commit()

    # Log to history regardless of cache hit
    db.execute(
        "INSERT INTO history (word, pos) VALUES (?, ?)",
        (word, result.get("pos", "")),
    )
    db.commit()

    return jsonify(result)


@app.route("/save-word", methods=["POST"])
def save_word():
    data = request.get_json(force=True)
    word = (data.get("word") or "").strip().lower()
    if not word:
        return jsonify({"error": "Missing 'word'"}), 400

    db = get_db()

    # Pull cached lookup data if present, to fill definition/context
    cached = db.execute("SELECT data FROM word_cache WHERE word = ?", (word,)).fetchone()
    cache_data = json.loads(cached["data"]) if cached else {}

    db.execute("""
        INSERT INTO saved_words (word, pos, definition, context, sentence, source_url, source_title)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(word) DO UPDATE SET
            sentence = excluded.sentence,
            source_url = excluded.source_url,
            source_title = excluded.source_title
    """, (
        word,
        cache_data.get("pos", ""),
        json.dumps(cache_data.get("definitions", [])),
        cache_data.get("context", ""),
        data.get("sentence", ""),
        data.get("sourceUrl", ""),
        data.get("sourceTitle", ""),
    ))
    db.commit()

    return jsonify({"status": "saved", "word": word})


@app.route("/saved-words", methods=["GET"])
def saved_words():
    db = get_db()
    rows = db.execute("""
        SELECT word, pos, definition, context, sentence, source_url, source_title,
               saved_at, repetitions, next_review, last_reviewed
        FROM saved_words
        ORDER BY saved_at DESC
    """).fetchall()

    result = []
    for r in rows:
        result.append({
            "word": r["word"],
            "pos": r["pos"],
            "definition": json.loads(r["definition"]) if r["definition"] else [],
            "context": r["context"],
            "sentence": r["sentence"],
            "source_url": r["source_url"],
            "source_title": r["source_title"],
            "saved_at": r["saved_at"],
            "repetitions": r["repetitions"],
            "next_review": r["next_review"],
            "last_reviewed": r["last_reviewed"],
        })
    return jsonify(result)


@app.route("/due-reviews", methods=["GET"])
def due_reviews():
    db = get_db()
    now = datetime.utcnow().isoformat()
    rows = db.execute("""
        SELECT word, pos, definition, context, repetitions, ease_factor, interval_days
        FROM saved_words
        WHERE next_review <= ?
        ORDER BY next_review ASC
    """, (now,)).fetchall()

    result = []
    for r in rows:
        result.append({
            "word": r["word"],
            "pos": r["pos"],
            "definition": json.loads(r["definition"]) if r["definition"] else [],
            "context": r["context"],
            "repetitions": r["repetitions"],
        })
    return jsonify(result)


@app.route("/review", methods=["POST"])
def review():
    """
    SM-2 spaced repetition update.
    Body: { "word": "ephemeral", "quality": 0-5 }
      quality: 0-2 = forgot, 3 = hard, 4 = good, 5 = easy
    """
    data = request.get_json(force=True)
    word = (data.get("word") or "").strip().lower()
    quality = int(data.get("quality", 3))

    db = get_db()
    row = db.execute(
        "SELECT ease_factor, interval_days, repetitions FROM saved_words WHERE word = ?",
        (word,)
    ).fetchone()

    if not row:
        return jsonify({"error": "Word not found in saved list"}), 404

    ease = row["ease_factor"]
    interval = row["interval_days"]
    reps = row["repetitions"]

    # SM-2 algorithm
    if quality < 3:
        reps = 0
        interval = 1
    else:
        reps += 1
        if reps == 1:
            interval = 1
        elif reps == 2:
            interval = 6
        else:
            interval = round(interval * ease)

    ease = max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    next_review = (datetime.utcnow() + timedelta(days=interval)).isoformat()

    db.execute("""
        UPDATE saved_words
        SET ease_factor = ?, interval_days = ?, repetitions = ?,
            next_review = ?, last_reviewed = ?
        WHERE word = ?
    """, (ease, interval, reps, next_review, datetime.utcnow().isoformat(), word))
    db.commit()

    return jsonify({
        "word": word,
        "next_review": next_review,
        "interval_days": interval,
        "repetitions": reps,
        "ease_factor": round(ease, 2),
    })


@app.route("/history", methods=["GET"])
def history():
    db = get_db()
    rows = db.execute("""
        SELECT word, pos, MAX(looked_up_at) as last_looked_up
        FROM history
        GROUP BY word
        ORDER BY last_looked_up DESC
        LIMIT 12
    """).fetchall()
    return jsonify([{"word": r["word"], "pos": r["pos"], "looked_up_at": r["last_looked_up"]} for r in rows])


@app.route("/stats", methods=["GET"])
def stats():
    db = get_db()

    total_saved = db.execute("SELECT COUNT(*) c FROM saved_words").fetchone()["c"]
    now = datetime.utcnow().isoformat()
    due_count = db.execute(
        "SELECT COUNT(*) c FROM saved_words WHERE next_review <= ?", (now,)
    ).fetchone()["c"]
    mastered = db.execute(
        "SELECT COUNT(*) c FROM saved_words WHERE repetitions >= 5"
    ).fetchone()["c"]
    total_lookups = db.execute("SELECT COUNT(*) c FROM history").fetchone()["c"]

    # Activity by day, last 21 days
    rows = db.execute("""
        SELECT date(looked_up_at) as d, COUNT(*) c
        FROM history
        WHERE looked_up_at >= date('now','-21 days')
        GROUP BY d
    """).fetchall()
    activity = {r["d"]: r["c"] for r in rows}

    return jsonify({
        "words_saved": total_saved,
        "due_for_review": due_count,
        "mastered": mastered,
        "total_lookups": total_lookups,
        "activity": activity,
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "merriam_configured": bool(MERRIAM_KEY),
        "claude_configured": bool(ANTHROPIC_API_KEY),
    })


if __name__ == "__main__":
    init_db()
    print("\n  Lexify backend running at http://localhost:5000")
    print(f"  Merriam-Webster API: {'configured' if MERRIAM_KEY else 'MISSING — set MERRIAM_KEY in .env'}")
    print(f"  Claude API:          {'configured' if ANTHROPIC_API_KEY else 'MISSING — set ANTHROPIC_API_KEY in .env'}\n")
    app.run(debug=True, port=5000)
