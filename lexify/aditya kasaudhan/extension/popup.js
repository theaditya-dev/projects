const API_BASE = "http://localhost:5000";

async function init() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");

  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    const data = await res.json();

    if (data.status === "ok") {
      dot.classList.add("ok");
      const missing = [];
      if (!data.merriam_configured) missing.push("Merriam-Webster key");
      if (!data.claude_configured) missing.push("Claude key");
      text.textContent = missing.length
        ? `Connected — missing: ${missing.join(", ")}`
        : "Connected to Lexify backend";
    }

    const stats = await fetch(`${API_BASE}/stats`).then(r => r.json());
    document.getElementById("savedCount").textContent = stats.words_saved;
    document.getElementById("dueCount").textContent = stats.due_for_review;

  } catch {
    dot.classList.add("bad");
    text.textContent = "Backend offline — run app.py on :5000";
  }
}

document.getElementById("openDash").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5000" });
});

init();
