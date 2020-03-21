let loaded = false;
let resFunc;
let websocket;

let callbackExecutionChain = new Promise((res, rej) => {
  resFunc = res;
});

window.addEventListener('load', function () {
  if (!loaded) {
    startUpWebSocket();
    loaded = true;
    resFunc();
  }
});

window.addEventListener('close', function () {
  ws.close();
});

let hasReturned = true;

function callbackMessenger(event, id, eventType) {
  let package = {
    targetID: id,
    eventType: eventType
  }
  if (hasReturned) {
    callbackExecutionChain.then(() => { websocket.send(JSON.stringify(package)) });
    hasReturned = false;
  }
}

function replaceBodyWithNewAppRender(htmlString) {
  document.getElementById("tsxlight-container").innerHTML = htmlString;
  hasReturned = true;
}

function startUpWebSocket() {
  let settingsDiv = document.getElementById('tsxlight-settings')
  let settingsStr = settingsDiv.content.replace(/\'/g, '\"');
  let settings = JSON.parse(settingsStr);
  let url = "";
  let protocol = settings.useSecureSocket ? "wss" : "ws";
  if (settings.mode == 0) {
    url = (protocol + "://127.0.0.1:3000/");
  } else {
    url = (protocol + "://" + settings.baseURL + (!settings.includePortInClientSocketUrl ? "" : (":" + (settings.processPort ? settings.processPort : settings.port))) + "/");
  }
  let ws = new WebSocket(url);
  ws.onopen = function (event) {
    console.log("Opened connection with " + url);
  };
  ws.addEventListener("message", (ev) => {
    replaceBodyWithNewAppRender(ev.data);
  })
  ws.onclose = function (ws, closeEvent) {
  };
  websocket = ws;
}