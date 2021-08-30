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
  const loadFileExtensionStatus = document.getElementById('loadFileExtensionStatus');

  performance.mark('loadFileExtension-start');

  fetch(urlInput.value, fetchOptions).then(
    text => {
      performance.mark('loadFileExtension-end');
      performance.measure('loadFileExtension', 'loadFileExtension-start', 'loadFileExtension-end');

      loadFileExtensionStatus.innerText = 'Status: Success';
    },
    error => {
      performance.mark('loadFileExtension-end');
      performance.measure('loadFileExtension', 'loadFileExtension-start', 'loadFileExtension-end');

      loadFileExtensionStatus.innerText = `Status: ${error.message}`;
    });
});

const loadFileWorkerButton = document.getElementById('loadFileWorkerButton');
loadFileWorkerButton.addEventListener('click', () => {
  const loadFileWorkerStatus = document.getElementById('loadFileWorkerStatus');
  const onMessage = ({data}) => {
    switch (data.type) {
      case 'fetch-file-error':
        worker.removeEventListener('message', onMessage);

        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');

        loadFileWorkerStatus.innerText = `Status: ${data.value}`;

        console.error('loadFilePage() failed:', data.value);
        break;
      case 'fetch-file-complete':
        worker.removeEventListener('message', onMessage);

        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');

        loadFileWorkerStatus.innerText = 'Status: Success';
        break;
    }
  };

  worker.addEventListener('message', onMessage);

  worker.postMessage({ type: 'fetch-file', value: urlInput.value });
});

const loadFilePageButton = document.getElementById('loadFilePageButton');
loadFilePageButton.addEventListener('click', () => {
  const loadFilePageStatus = document.getElementById('loadFilePageStatus');

  const onMessage = message => {
    switch (message.type) {
      case 'fetch-file-error':
        backgroundPageConnection.onMessage.removeListener(onMessage);

        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');

        loadFilePageStatus.innerText = `Status: ${message.value}`;

        console.error('loadFilePage() failed:', message.value);
        break;
      case 'fetch-file-complete':
        backgroundPageConnection.onMessage.removeListener(onMessage);

        performance.mark('loadFilePage-end');
        performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');

        loadFilePageStatus.innerText = 'Status: Success';
        break;
    }
  };

  backgroundPageConnection.onMessage.addListener(onMessage);

  performance.mark('loadFilePage-start');
  chrome.devtools.inspectedWindow.eval(`
    window.postMessage({ type: 'fetch-file', value: "${urlInput.value}" });
  `);
});
