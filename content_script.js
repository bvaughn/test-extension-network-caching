const port = chrome.runtime.connect({name: "content-script"});
port.onMessage.addListener(message => {
  console.log('[content_script] port.onMessage()', message);
});

window.addEventListener("message", event => {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  const message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || !message.source === 'test-page') {
    return;
  }

  chrome.runtime.sendMessage(message);
});