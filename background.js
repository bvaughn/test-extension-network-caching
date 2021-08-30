chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.type) {
      case 'fetch-file-complete':
      case 'fetch-file-error':
        devToolsConnection.postMessage(request);
        break;
    }
  });
})