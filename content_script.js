window.addEventListener("message", event => {
  if (event.data.type === "fetch-file") {
    const url = event.data.value;

    const reject = value => {
      chrome.runtime.sendMessage({
        type: 'fetch-file-error',
        value,
      });
    };

    const resolve = value => {
      chrome.runtime.sendMessage({
        type: 'fetch-file-complete',
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
