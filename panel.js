const worker = new Worker('worker.js');

const fetchOptions = {
  cache: 'default',
};

const URL = 'https://unpkg.com/jquery@3.6.0/dist/jquery.js';

const cacheModeSelect = document.getElementById('cacheModeSelect');
cacheModeSelect.addEventListener('change', () => {
  fetchOptions.cache = cacheModeSelect.value;

  worker.postMessage({ type: 'set-cache-mode', value: cacheModeSelect.value });
});

const loadFileExtensionButton = document.getElementById('loadFileExtensionButton');
loadFileExtensionButton.addEventListener('click', () => {
  fetchFile(URL);
});

const loadFileWorkerButton = document.getElementById('loadFileWorkerButton');
loadFileWorkerButton.addEventListener('click', () => {
  worker.postMessage({ type: 'fetch-file', value: URL });
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
  performance.mark('loadFilePage-start');
  chrome.devtools.inspectedWindow.eval(`
    window.postMessage({ type: 'fetch-file', value: "${URL}" });
  `);
});

window.addEventListener("message", ({data}) => {
  console.log('[panel] "message" data:', data);
  switch (data.type) {
    case 'fetch-failed':
      performance.mark('loadFilePage-end');
      performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');
      console.error('loadFilePage() failed:', data.value);
      break;
    case 'fetched-file':
      performance.mark('loadFilePage-end');
      performance.measure('loadFilePage', 'loadFilePage-start', 'loadFilePage-end');
      console.log('loadFilePage() text:', data.value.length);
      break;
  }
});