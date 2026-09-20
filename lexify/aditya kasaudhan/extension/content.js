/**
 * Lexify content script
 * Injected into every page. Detects text selection, shows a small popup
 * with "Define" and "Save" buttons, and talks to the local Flask backend
 * via the background service worker.
 */

const API_BASE = "http://localhost:5000";
let lexifyPopup = null;
let lexifyCard = null;

// ── Detect selection ────────────────────────────────────────────────────
document.addEventListener("mouseup", (e) => {
  // Ignore clicks inside our own UI
  if (e.target.closest("#lexify-popup") || e.target.closest("#lexify-card")) return;

  removePopup();
  removeCard();

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text || text.split(/\s+/).length > 4 || text.length > 60) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  showPopup(text, rect, range);
});

// Dismiss on click elsewhere
document.addEventListener("mousedown", (e) => {
  if (!e.target.closest("#lexify-popup") && !e.target.closest("#lexify-card")) {
    removePopup();
    removeCard();
  }
});

// ── Popup: small floating "Define / Save" pill ──────────────────────────
function showPopup(word, rect, range) {
  lexifyPopup = document.createElement("div");
  lexifyPopup.id = "lexify-popup";
  lexifyPopup.innerHTML = `
    <button class="lx-btn lx-define">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
      Define
    </button>
    <button class="lx-btn lx-save">
      <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      Save
    </button>
  `;

  const top = window.scrollY + rect.top - 44;
  const left = window.scrollX + rect.left;
  lexifyPopup.style.top = `${top}px`;
  lexifyPopup.style.left = `${left}px`;

  document.body.appendChild(lexifyPopup);

  lexifyPopup.querySelector(".lx-define").addEventListener("click", () => {
    const sentence = getSurroundingSentence(range);
    showCard(word, rect, sentence, false);
    removePopup();
  });

  lexifyPopup.querySelector(".lx-save").addEventListener("click", () => {
    const sentence = getSurroundingSentence(range);
    saveWord(word, sentence);
    showToast(`Saved "${word}" to Lexify`);
    removePopup();
  });
}

function removePopup() {
  if (lexifyPopup) {
    lexifyPopup.remove();
    lexifyPopup = null;
  }
}

// ── Card: full definition card shown on "Define" ────────────────────────
async function showCard(word, rect, sentence, autoSave) {
  lexifyCard = document.createElement("div");
  lexifyCard.id = "lexify-card";
  lexifyCard.innerHTML = `
    <div class="lx-card-header">
      <span class="lx-card-word">${word}</span>
      <button class="lx-close" aria-label="Close">&times;</button>
    </div>
    <div class="lx-card-body lx-loading">
      <div class="lx-spinner"></div> Looking up…
    </div>
  `;

  const top = window.scrollY + rect.bottom + 8;
  const left = Math.min(window.scrollX + rect.left, window.scrollX + window.innerWidth - 340);
  lexifyCard.style.top = `${top}px`;
  lexifyCard.style.left = `${left}px`;

  document.body.appendChild(lexifyCard);
  lexifyCard.querySelector(".lx-close").addEventListener("click", removeCard);

  try {
    const res = await fetch(`${API_BASE}/lookup?word=${encodeURIComponent(word.toLowerCase())}`);
    const data = await res.json();
    renderCard(word, data, sentence);
  } catch (err) {
    lexifyCard.querySelector(".lx-card-body").innerHTML = `
      <div class="lx-error">
        Couldn't reach Lexify backend.<br>
        <span style="font-size:11px;opacity:.7">Make sure the Flask server is running on localhost:5000</span>
      </div>`;
  }
}

function renderCard(word, data, sentence) {
  const defs = (data.definitions || []).slice(0, 2)
    .map((d, i) => `<div class="lx-def"><span class="lx-def-n">${i + 1}</span> ${d}</div>`)
    .join("");

  const syns = (data.synonyms || []).slice(0, 5)
    .map(s => `<span class="lx-syn">${s}</span>`)
    .join("");

  lexifyCard.querySelector(".lx-card-body").innerHTML = `
    <div class="lx-meta">
      <span class="lx-phonetic">${data.phonetic || ""}</span>
      ${data.pos ? `<span class="lx-pos">${data.pos}</span>` : ""}
      ${data.register ? `<span class="lx-register">${data.register}</span>` : ""}
    </div>
    <div class="lx-section">${defs || "No definition found."}</div>
    ${data.context ? `<div class="lx-context">${data.context}</div>` : ""}
    ${syns ? `<div class="lx-synrow">${syns}</div>` : ""}
    <button class="lx-save-full">
      <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      Save to Lexify
    </button>
  `;

  lexifyCard.querySelector(".lx-save-full").addEventListener("click", (e) => {
    saveWord(word, sentence);
    e.target.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg> Saved`;
    e.target.classList.add("lx-saved");
    showToast(`Saved "${word}" to Lexify`);
  });
}

function removeCard() {
  if (lexifyCard) {
    lexifyCard.remove();
    lexifyCard = null;
  }
}

// ── Save word via background script ─────────────────────────────────────
function saveWord(word, sentence) {
  chrome.runtime.sendMessage({
    type: "SAVE_WORD",
    word: word.toLowerCase(),
    sentence: sentence,
    sourceUrl: window.location.href,
    sourceTitle: document.title,
  });
}

// ── Grab the sentence surrounding the highlighted word ───────────────────
function getSurroundingSentence(range) {
  try {
    let node = range.startContainer;
    let text = node.textContent || "";
    if (node.nodeType !== Node.TEXT_NODE) {
      text = node.innerText || node.textContent || "";
    }
    // Find sentence boundaries around the selection
    const offset = range.startOffset;
    const before = text.slice(0, offset);
    const after = text.slice(offset);

    const startMatch = before.match(/[^.!?]*$/);
    const endMatch = after.match(/^[^.!?]*[.!?]?/);

    const sentence = (startMatch ? startMatch[0] : "") + (endMatch ? endMatch[0] : "");
    return sentence.trim().slice(0, 280);
  } catch {
    return "";
  }
}

// ── Toast notification ────────────────────────────────────────────────
function showToast(message) {
  const toast = document.createElement("div");
  toast.id = "lexify-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("lx-show"));
  setTimeout(() => {
    toast.classList.remove("lx-show");
    setTimeout(() => toast.remove(), 200);
  }, 2200);
}
