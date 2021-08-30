const fetchOptions = {
  cache: 'default',
};

self.addEventListener('message', ({data}) => {
  switch (data.type) {
    case 'fetch-file':
      fetchFile(data.value);
      break;
    case 'set-cache-mode':
      fetchOptions.cache = data.value;
      break;
  }
});

function fetchFile(url) {
  performance.mark('loadFileWorker-start');
  fetch(url, fetchOptions).then(text => {
    performance.mark('loadFileWorker-end');
    performance.measure('loadFileWorker', 'loadFileWorker-start', 'loadFileWorker-end');
    console.log('loadFileWorker() text:', text);
  });
}