//卸载Utterances
function unmountUtterances() {
  const container = document.getElementById("utterances-container");
  if (!container) return;
  container.innerHTML = "";
}
//挂载Utterances
function mountUtterances(opts = {}) {
  const container = document.getElementById("utterances-container");
  if (!container) return;
  unmountUtterances();
  const repo = opts.repo || "FanRec/FanRec.github.io";
  const issueTerm = opts.issueTerm || "title";
  const theme =
    opts.theme ||
    (document.body.classList.contains("night-mode")
      ? "github-dark"
      : "github-light");

  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("repo", repo);
  script.setAttribute("issue-term", issueTerm);
  script.setAttribute("theme", theme);
  container.appendChild(script);
}
function sendThemeToUtterances(theme) {
  const message = {
    type: "set-theme",
    theme: theme,
  };
  function attempt() {
    const iframe = document.querySelector("iframe.utterances-frame");
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, "https://utteranc.es");
    } else {
      if (!window._utteranceRetryCount) window._utteranceRetryCount = 0;
      if (window._utteranceRetryCount < 10) {
        window._utteranceRetryCount++;
        setTimeout(attempt, 500);
      }
    }
  }

  attempt();
}

export { unmountUtterances, mountUtterances, sendThemeToUtterances };
