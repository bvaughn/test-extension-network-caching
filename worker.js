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

  const reject = message => {
    self.postMessage({
      type: 'fetch-file-error',
      value: message,
    });
  };

  const resolve = text => {
    self.postMessage({
      type: 'fetch-file-complete',
      value: text,
    });
  };

  fetch(url, fetchOptions).then(
    response => {
      if (response.ok) {
        response.text().then(resolve);
      } else {
        reject('Response not okay');
      }
    },
    error => reject(error.message)
  );
}