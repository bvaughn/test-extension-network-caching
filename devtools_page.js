const backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-page"
});
backgroundPageConnection.onMessage.addListener(message => {
  console.log('[devtools_page] backgroundPageConnection.onMessage() message:', message);
});


chrome.devtools.panels.create(
  "Network caching test",
  "",
  "panel.html",
  function create(panel) {
    panel.onShown.addListener(container => {});
  }
);

function injectable() {
  console.log('[injectable] Injected');

  window.addEventListener("message", event => {
    console.log('[injectable] on "message", event');
    if (event.data.type === "fetch-file") {
      const url = event.data.value;

      const reject = value => {
        window.postMessage({
          type: 'fetch-failed',
          value,
        });
      };

      const resolve = value => {
        window.postMessage({
          type: 'fetched-file',
          value,
        });
      };

      fetch(url, {cache: 'force-cache'}).then(
        response => {
          if (response.ok) {
            response
              .text()
              .then(text => resolve(text))
              .catch(error => reject(null));
          } else {
            reject(null);
          }
        },
        error => reject(null),
      );
    }
  });
}

chrome.devtools.network.onNavigated.addListener(() => {
  console.log('[devtools_page] onNavigated()');

  const tabId = chrome.devtools.inspectedWindow.tabId;
  const port = chrome.runtime.connect({
    name: '' + tabId,
  });
  port.onMessage.addListener(message => {
    console.log('[devtools_page] port.onMessage()', message);
    chrome.devtools.inspectedWindow.eval(
      `window.postMessage(${message});`,
    );
  });

  chrome.devtools.inspectedWindow.eval(`
    (${injectable.toString()})()
  `);
});