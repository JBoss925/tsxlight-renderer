import { Request, Response } from 'express';
import { ServerManager } from '../managers/serverManager';
import { tsxlight } from '../tsxlight';
import { CallbackManager } from '../managers/callbackManager';
import { request, connection, IMessage } from 'websocket';
import { TSXSettings, RenderMode } from '../managers/settingsManager';
import { UserManager } from '../managers/userManager';
let fs = require('fs');

// let app = ServerManager.app;
// let io: SocketIO.Server = ServerManager.io;

type Package = {
  targetID: string,
  eventType: string
};

export let socketToUserID: Map<connection, string> = new Map();
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

ServerManager.app.get('/scripts/electronEventMsg.js', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/javascript');
  let s = fs.readFileSync('template/scripts/electronEventMsg.js');
  res.send(Buffer.alloc(s.length, s));
});

ServerManager.app.get('/', (req: Request, res: Response) => {
  res.set('Content-Type', 'text/html');
  let s = fs.readFileSync('template/templateTempElectron.html');
  res.send(Buffer.alloc(s.length, s));
});

ServerManager.wsServer.on("request", function (request: request) {
  console.log("REQUEST!");
  let connection = request.accept(undefined, request.origin);
});

ServerManager.wsServer.on("connect", function (connection: connection) {
  console.log("CONNECTION!");
  if (!socketToUserID.has(connection)) {
    setupSocket(connection);
  }
});

let setupRenderer = (socket: connection) => {
  let id: string;
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
    id = UserManager.getElectronUserID();
  } else {
    id = socket.remoteAddress;
  }
  console.log("HERE2");
  tsxlight.transitionToPage(TSXSettings.getSettings().homepagePageID, id);
}

let setupSocket = (socket: connection) => {
  let id: string;
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
    id = UserManager.getElectronUserID();
  } else {
    id = socket.remoteAddress;
  }
  socketToUserID.set(socket, id);
  userIDToSocket.set(id, socket);
  console.log("HERE1");
  setupRenderer(socket);
  console.log("HERE3");
  socket.on('message', (data: IMessage) => {
    console.log(data.utf8Data);
    if (data.utf8Data != undefined) {
      let pack = JSON.parse(data.utf8Data as string);
      callbackMessenger(socket, pack);
    }
  })
  socket.socket.on('close', () => { close(socket) });
};

function close(socket: connection) {
  let x = socketToUserID.get(socket);
  if (x == undefined) {
    throw new Error("Socket disconnected that wasn't registered! With client id: " + socket.remoteAddress);
  }
  socketToUserID.delete(socket);
  userIDToSocket.delete(x);
}

function callbackMessenger(socket: connection, cbPackage: Package) {
  let usrID = userIDFromSocket(socket);
  let callbackID: string = "";
  callbackID += "/";
  callbackID += cbPackage.targetID;
  callbackID += "/";
  callbackID += cbPackage.eventType
  console.log("CB MESSENGER");
  console.log(usrID, callbackID);
  if (tsxlight.userIDtoRenderer.has(usrID)) {
    CallbackManager.callCallback(usrID, callbackID);
    CallbackManager.clearCallbacksForUserID(usrID);
    tsxlight.rerender(usrID);
  } else {
    CallbackManager.clearCallbacksForUserID(usrID);
    tsxlight.rerender(usrID);
    CallbackManager.callCallback(usrID, callbackID);
    CallbackManager.clearCallbacksForUserID(usrID);
    tsxlight.rerender(usrID);
  }
}