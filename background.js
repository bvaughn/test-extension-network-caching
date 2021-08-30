chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    devToolsConnection.postMessage(request)
  });
})

const ports = {};

function connected(port) {
  console.log('[background] connected() port:', port);
  let tab = null;
  let name = null;
  if (isNumeric(port.name)) {
    console.log('[background] connected() -> "devtools"');
    tab = port.name;
    name = 'devtools';
    // installContentScript(+port.name);
  } else {
    console.log('[background] connected() -> "content-script"');
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab]['content-script']) {
    console.log('[background] connecting double pipe ...');
    doublePipe(ports[tab].devtools, ports[tab]['content-script']);
  }
}

chrome.runtime.onConnect.addListener(connected);

function doublePipe(one, two) {
  one.onMessage.addListener(lOne);
  function lOne(message) {
    console.log('[background] port one onMessage()', message);
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    console.log('[background] port two onMessage()', message);
    one.postMessage(message);
  }
  function shutdown() {
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}


function isNumeric(str) {
  return +str + '' === str;
}