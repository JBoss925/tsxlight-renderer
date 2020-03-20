import { Request, Response } from 'express';
import { ServerManager } from '../managers/serverManager';
import { tsxlight } from '../tsxlight';
import { CallbackManager } from '../managers/callbackManager';
import { TSXSettings, RenderMode } from '../managers/settingsManager';
import { UserManager } from '../managers/userManager';
import { PageManager } from '../managers/pageManager';
import { WebsocketRequestHandler } from 'express-ws'
import express from 'express';
import expressws from 'express-ws';
import core from 'express';
let fs = require('fs');

type Package = {
  targetID: string,
  eventType: string
};

let connIndex = 0;

export let socketToUserID: Map<any, string> = new Map();
export let connectedRemoteAddresses = new Set<string>();
export let userIDToSocket: Map<string, any> = new Map();

export let userIDFromSocket = (socket: any) => {
  if (!socketToUserID.has(socket)) {
    throw new Error("Cannot get userID from socket!")
  }
  return socketToUserID.get(socket) as string;
};

export let socketFromUserID = (userID: string) => {
  if (!userIDToSocket.has(userID)) {
    throw new Error("Cannot get socker from userID: " + userID + "!")
  }
  return userIDToSocket.get(userID);
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

ServerManager.wsServer.app.ws("/", (ws: any, req: express.Request<any>, next: express.NextFunction) => {
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON && electronDidConnect) {
    req.destroy();
    return;
  }
  electronDidConnect = true;

  if (TSXSettings.getSettings().expressSettings.limit1Connection) {
    console.log("HERE!", req.ip);
    if (!userIDToSocket.has(req.ip)) {
      setupSocket(req.ip, ws);
    } else {
      let conn = userIDToSocket.get(req.ip);
      close(conn);
      setupSocket(req.ip, ws);
    }
  } else {
    setupSocket(req.ip, ws);
  }
});

let setupRenderer = (socket: any) => {
  let id: string = (socket as any)['userID'];
  if (UserManager.userIDToTsxID.has(id)) {
    tsxlight.transitionToPage(PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(id)), id);
  } else {
    tsxlight.transitionToPage(TSXSettings.getSettings().homepagePageID, id);
  }
}

let setupSocket = (ip: string, socket: any) => {
  let id: string;
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
    id = UserManager.getElectronUserID();
  } else {
    if (TSXSettings.getSettings().expressSettings.limit1Connection) {
      id = ip;
    } else {
      id = (ip + connIndex);
      connIndex++;
    }
  }
  (socket as any)['userID'] = id;
  socketToUserID.set(socket, id);
  userIDToSocket.set(id, socket);
  setupRenderer(socket);
  socket.on('message', (data: any) => {
    if (data != undefined) {
      let pack = JSON.parse(data as string);
      callbackMessenger(socket, pack);
    }
  });
  socket.on('close', () => { });
};

function close(socket: any) {
  socket.send("<div style=\"display:flex;justify-content:center;align-content:center;\"><p style=\"font-size:24pt;padding-top:2em;font-weight:800;font-family:Arial;\">Connected on another tab. Refresh to reset the current tab as the app tab.</p></div>");
  socket.close();
  let x = socketToUserID.get(socket);
  if (x == undefined) {
    throw new Error("Socket disconnected that wasn't registered! With client id: " + (socket as any)['userID']);
  }
  socketToUserID.delete(socket);
  userIDToSocket.delete(x);
}

function callbackMessenger(socket: any, cbPackage: Package) {
  let usrID = (socket as any)['userID'] as string;
  let callbackID: string = "";
  callbackID += "/";
  callbackID += cbPackage.targetID;
  callbackID += "/";
  callbackID += cbPackage.eventType
  let currPageID = PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(usrID));
  if (tsxlight.userIDtoRenderer.has(usrID)) {
    CallbackManager.callCallback(usrID, currPageID, callbackID);
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
  } else {
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
    CallbackManager.callCallback(usrID, currPageID, callbackID);
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
  }
}