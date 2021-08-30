const backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});

chrome.devtools.panels.create(
  "Network caching test",
  "",
  "panel.html",
  function create(panel) {
    panel.onShown.addListener(container => {
      container.backgroundPageConnection = backgroundPageConnection;
    });
  }
);
