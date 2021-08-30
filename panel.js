const worker = new Worker('worker.js');

const fetchOptions = {
  cache: 'default',
};

const urlInput = document.getElementById('urlInput');

const cacheModeSelect = document.getElementById('cacheModeSelect');
cacheModeSelect.addEventListener('change', () => {
  fetchOptions.cache = cacheModeSelect.value;

  worker.postMessage({ type: 'set-cache-mode', value: cacheModeSelect.value });
});

const loadFileExtensionButton = document.getElementById('loadFileExtensionButton');
loadFileExtensionButton.addEventListener('click', () => {
  fetchFile(urlInput.value);
});

const loadFileWorkerButton = document.getElementById('loadFileWorkerButton');
loadFileWorkerButton.addEventListener('click', () => {
  worker.postMessage({ type: 'fetch-file', value: urlInput.value });
});

function fetchFile(url) {
  performance.mark('loadFileExtension-start');
  fetch(url, fetchOptions).then(text => {
    performance.mark('loadFileExtension-end');
    performance.measure('loadFileExtension', 'loadFileExtension-start', 'loadFileExtension-end');
    console.log('loadFileExtension() text:', text);
  });
}

const loadFilePageButton = document.getElementById('loadFilePageButton');
loadFilePageButton.addEventListener('click', () => {
  const onMessage = message => {
    console.log('[panel] backgroundPageConnection.onMessage() message:', message);
    switch (message.type) {
      case 'fetch-file-error':
        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');
        console.error('loadFilePage() failed:', message.value);
        backgroundPageConnection.onMessage.removeListener(onMessage);
        break;
      case 'fetch-file-complete':
        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');
        console.log('loadFilePage() text:', message.value);
        backgroundPageConnection.onMessage.removeListener(onMessage);
        break;
    }
  };

  backgroundPageConnection.onMessage.addListener(onMessage);

  performance.mark('loadFilePage-start');
  chrome.devtools.inspectedWindow.eval(`
    window.postMessage({ type: 'fetch-file', value: "${urlInput.value}" });
  `);
});
