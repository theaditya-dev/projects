# Lexify — Full Working Build

A complete AI vocabulary app: Flask backend (Merriam-Webster + Claude), a
local dashboard, and a Chrome extension that lets you highlight any word on
any webpage to define and save it.

```
lexify-full/
├── backend/
│   ├── app.py                 ← Flask API + serves the dashboard
│   ├── static_dashboard.html  ← the dashboard UI (served at /)
│   ├── requirements.txt
│   ├── .env.example
│   └── lexify.db               (auto-created on first run)
└── extension/
    ├── manifest.json
    ├── content.js / content.css   ← highlight-to-define popup
    ├── background.js              ← talks to the Flask API
    ├── popup.html / popup.js      ← toolbar icon popup
    └── icons/
```

## 1. Backend setup (5 minutes)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste in your two keys (see below)
```

### Get your API keys

| Key | Where | Cost |
|---|---|---|
| `MERRIAM_KEY` | https://dictionaryapi.com/register/index → **Collegiate Dictionary** | Free |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com | Free starter credits |

> **The app works even without keys** — `/health` will show what's missing,
> and `/lookup` degrades gracefully (empty definition/context) so you can
> test the plumbing before wiring up real keys.

### Run it

```bash
python app.py
```

Open **http://localhost:5000** — this is your dashboard. Try looking up a
word in the sidebar search.

## 2. Chrome extension setup (2 minutes)

1. Open `chrome://extensions` in Chrome
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Done — the Lexify icon appears in your toolbar

**Important:** the backend (`python app.py`) must be running on
`localhost:5000` for the extension to work.

### Using the extension

Go to any webpage — a news article, Wikipedia, a novel on Project Gutenberg —
and **highlight any single word or short phrase**. A small dark pill appears
with two buttons:

- **Define** — opens a card with definition, context, synonyms, etymology
- **Save** — saves the word + the sentence it appeared in + the page URL,
  directly to your Lexify database

Click the Lexify toolbar icon any time to see your saved-word count and
words due for review, and to jump to the dashboard.

## 3. How the pieces connect

```
┌─────────────┐   highlight    ┌──────────────┐   GET /lookup    ┌─────────────┐
│   Webpage    │ ─────────────▶│ content.js   │ ───────────────▶ │             │
│ (any site)   │   word + ctx   │ (popup/card) │                  │   Flask     │
└─────────────┘                └──────┬───────┘                  │   backend   │
                                       │ click "Save"             │  (app.py)   │
                                       ▼                          │             │
                                ┌──────────────┐  POST /save-word │  SQLite DB  │
                                │ background.js│ ───────────────▶ │ word_cache  │
                                └──────────────┘                  │ history     │
                                                                   │ saved_words │
┌─────────────┐   GET /stats, /saved-words, /due-reviews          └─────────────┘
│  Dashboard   │ ◀─────────────────────────────────────────────────────┘
│ (localhost)  │
└─────────────┘
```

## 4. API reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/lookup?word=ephemeral` | Definition (Merriam-Webster) + context/etymology/synonyms (Claude). Cached in SQLite. |
| POST | `/save-word` | Save a word, with optional sentence/source URL from the extension |
| GET | `/saved-words` | All saved words with review status |
| GET | `/due-reviews` | Words due for spaced-repetition review today |
| POST | `/review` | Submit a review (`quality` 0–5) → updates SM-2 schedule |
| GET | `/history` | Recent lookups (for the sidebar) |
| GET | `/stats` | Dashboard metrics |
| GET | `/health` | Check if API keys are configured |

## 5. Caching — why it matters

Every `/lookup` first checks `word_cache` in SQLite. If the word was looked
up before, it returns instantly with **zero API calls**. This means:

- Repeated lookups of common words ("ephemeral", "serendipity") cost nothing
- Your Claude API bill stays low even with heavy personal use
- The app works offline for any word you've already looked up

## 6. Spaced repetition (SM-2)

When you save a word, it enters a review queue with `next_review = now`.
On the dashboard, due words show **Forgot / Good / Easy** buttons:

- **Forgot** → resets repetitions, reviews again tomorrow
- **Good** → standard SM-2 interval growth (1 day → 6 days → ×ease factor)
- **Easy** → same growth but increases the ease factor faster

A word reviewed 5+ times successfully counts as **mastered** on your dashboard.

## 7. Troubleshooting

**Extension popup shows "Backend offline"**
→ Make sure `python app.py` is running and shows `Running on http://127.0.0.1:5000`

**Lookup returns empty definitions**
→ Check `/health` — if `merriam_configured: false`, your `.env` key is missing or wrong

**Extension popup/card doesn't appear on a page**
→ Some sites (chrome:// pages, the Chrome Web Store) block content scripts —
this is a Chrome restriction, not a bug

**CORS errors in browser console**
→ The backend sends permissive CORS headers automatically (see `app.py`).
Make sure you're hitting `http://localhost:5000`, not `127.0.0.1`, consistently.

## 8. Next steps (from here, you're in "Phase 4" of the roadmap)

- Add user accounts (Flask-Login + password hashing) so this works for
  multiple people / across devices
- Deploy backend to Railway/Render and update `API_BASE` in the extension
- Publish the extension to the Chrome Web Store ($5 one-time fee)
- Add a proper flashcard quiz UI (currently the dashboard shows due-review
  rows — wrap these in a swipeable card view)
