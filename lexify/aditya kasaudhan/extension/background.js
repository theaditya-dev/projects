/**
 * Lexify background service worker
 * Receives messages from content.js and forwards them to the local
 * Flask backend. Centralizing fetches here avoids CORS issues that
 * can occur from content scripts on some sites.
 */

const API_BASE = "http://localhost:5000";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_WORD") {
    fetch(`${API_BASE}/save-word`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: message.word,
        sentence: message.sentence,
        sourceUrl: message.sourceUrl,
        sourceTitle: message.sourceTitle,
      }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));

    return true; // keep the message channel open for the async response
  }
});
