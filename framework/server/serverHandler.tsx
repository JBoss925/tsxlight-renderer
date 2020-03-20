import { Request, Response } from 'express';
import { ServerManager } from '../managers/serverManager';
import { tsxlight } from '../tsxlight';
import { CallbackManager } from '../managers/callbackManager';
import { request, connection, IMessage } from 'websocket';
import { TSXSettings, RenderMode } from '../managers/settingsManager';
import { UserManager } from '../managers/userManager';
import { PageManager } from '../managers/pageManager';
let fs = require('fs');

type Package = {
  targetID: string,
  eventType: string
};

let connIndex = 0;

export let socketToUserID: Map<connection, string> = new Map();
export let connectedRemoteAddresses = new Set<string>();
export let userIDToSocket: Map<string, connection> = new Map();

export let userIDFromSocket = (socket: connection) => {
  if (!socketToUserID.has(socket)) {
    throw new Error("Cannot get userID from socket!")
  }
  return socketToUserID.get(socket) as string;
};

export let socketFromUserID = (userID: string) => {
  if (!userIDToSocket.has(userID)) {
    throw new Error("Cannot get socker from userID: " + userID + "!")
  }
  return userIDToSocket.get(userID) as connection;
};

let script = fs.readFileSync('template/scripts/electronEventMsg.js');
let scriptBuffer = Buffer.alloc(script.length, script);

ServerManager.app.get('/scripts/electronEventMsg.js', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/javascript');
  res.send(scriptBuffer);
});

ServerManager.app.get('/', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/html');
  let s = fs.readFileSync('template/templateTempElectron.html');
  res.send(Buffer.alloc(s.length, s));
});

let electronDidConnect = false;

ServerManager.wsServer.on("request", function (request: request) {
  console.log("REQUEST!");
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON && electronDidConnect) {
    request.reject();
    return;
  }
  let connection = request.accept(undefined, request.origin);
  electronDidConnect = true;
});

ServerManager.wsServer.on("connect", function (connection: connection) {
  console.log("CONNECTION!");
  if (TSXSettings.getSettings().expressSettings.limit1Connection) {
    if (!userIDToSocket.has(connection.remoteAddress)) {
      setupSocket(connection);
    } else {
      let conn = userIDToSocket.get(connection.remoteAddress) as connection;
      close(conn);
      setupSocket(connection);
    }
  } else {
    setupSocket(connection);
  }
});

let setupRenderer = (socket: connection) => {
  let id: string = (socket as any)['userID'];
  console.log("SETUPRENDERER: ", id);
  if (UserManager.userIDToTsxID.has(id)) {
    tsxlight.transitionToPage(PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(id)), id);
  } else {
    tsxlight.transitionToPage(TSXSettings.getSettings().homepagePageID, id);
  }
}

let setupSocket = (socket: connection) => {
  let id: string;
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
    id = UserManager.getElectronUserID();
  } else {
    if (TSXSettings.getSettings().expressSettings.limit1Connection) {
      id = socket.remoteAddress;
    } else {
      id = (socket.remoteAddress + connIndex);
      connIndex++;
    }
  }
  (socket as any)['userID'] = id;
  socketToUserID.set(socket, id);
  userIDToSocket.set(id, socket);
  setupRenderer(socket);
  socket.on('message', (data: IMessage) => {
    console.log(data.utf8Data);
    if (data.utf8Data != undefined) {
      let pack = JSON.parse(data.utf8Data as string);
      callbackMessenger(socket, pack);
    }
  })
  socket.on('close', () => { });
};

function close(socket: connection) {
  socket.send("<div style=\"display:flex;justify-content:center;align-content:center;\"><p style=\"font-size:24pt;padding-top:2em;font-weight:800;font-family:Arial;\">Connected on another tab. Refresh to reset the current tab as the app tab.</p></div>");
  socket.close();
  let x = socketToUserID.get(socket);
  if (x == undefined) {
    throw new Error("Socket disconnected that wasn't registered! With client id: " + (socket as any)['userID']);
  }
  socketToUserID.delete(socket);
  userIDToSocket.delete(x);
}

function callbackMessenger(socket: connection, cbPackage: Package) {
  let usrID = (socket as any)['userID'] as string;
  let callbackID: string = "";
  callbackID += "/";
  callbackID += cbPackage.targetID;
  callbackID += "/";
  callbackID += cbPackage.eventType
  console.log("CB MESSENGER");
  console.log(usrID, callbackID);
  let currPageID = PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(usrID));
  if (tsxlight.userIDtoRenderer.has(usrID)) {
    console.log("1");
    CallbackManager.callCallback(usrID, currPageID, callbackID);
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
  } else {
    console.log("2");
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
    CallbackManager.callCallback(usrID, currPageID, callbackID);
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
  }
}