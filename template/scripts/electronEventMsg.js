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

let windowSizeSampleRateMS = 100;
let lastSample = 0;

window.addEventListener("resize", (ev) => {
  // Possible sample rate limiting code
  // if (Date.now() - lastSample > windowSizeSampleRateMS) {
  let screenInfo = { type: "screenSize", width: window.innerWidth, height: window.innerHeight };
  websocket.send(JSON.stringify(screenInfo));
  // lastSample = Date.now();
  // }
});

let hasReturned = true;

function callbackMessenger(event, id, eventType) {
  let packageVar;
  if (id == "tsxlight-body" && eventType == 'onClick') {
    packageVar = {
      type: "callback",
      targetID: id,
      eventType: eventType,
      event: {
        isTrusted: true,
        screenX: event.screenX,
        screenY: event.screenY,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        button: event.button,
        buttons: event.buttons,
        relatedTarget: {
          id: event.relatedTarget?.id
        },
        pageX: event.pageX,
        pageY: event.pageY,
        movementX: event.movementX,
        movementY: event.movementY,
        layerX: event.layerX,
        layerY: event.layerY,
        detail: event.detail,
        sourceCapabilities: { firesTouchEvents: event.sourceCapabilities?.firesTouchEvents },
        which: event.which,
        type: event.type,
        currentTarget: {
          id: event.currentTarget?.id
        },
        eventPhase: event.eventPhase,
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        composed: event.composed,
        timeStamp: event.timeStamp,
        returnValue: event.returnValue,
        cancelBubble: event.cancelBubble,
        target: {
          id: event.target?.id
        },
        x: event.x,
        y: event.y,
        offsetX: event.offsetX,
        offsetY: event.offsetY
      }
    }
  } else {
    packageVar = {
      type: "callback",
      targetID: id,
      eventType: eventType,
      event: undefined
    }
  }
  callbackExecutionChain.then(() => { websocket.send(JSON.stringify(packageVar)) });
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
    let screenInfo = { type: "screenSize", width: window.innerWidth, height: window.innerHeight };
    ws.send(JSON.stringify(screenInfo));
    let setupPack = { type: "setup" };
    ws.send(JSON.stringify(setupPack));
  };
  ws.addEventListener("message", (ev) => {
    replaceBodyWithNewAppRender(ev.data);
  })
  ws.onclose = function (ws, closeEvent) {
  };
  websocket = ws;
}