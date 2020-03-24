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
import { ScreenSizeManager } from '../managers/screenSizeManager';
import { BaseHooks } from '../managers/baseHooks';
import { onClickHookID } from '../constants/constants';
import { CBPackage } from '../types/types';
let fs = require('fs');

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
  let addr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress) as string;
  if (addr == undefined) {
    throw new Error("Remote address for connection undefined!");
  }
  if (TSXSettings.getSettings().expressSettings.limit1Connection) {
    if (!userIDToSocket.has(addr)) {
      setupSocketCalls(addr, ws);
    } else {
      let conn = userIDToSocket.get(addr);
      close(conn);
      setupSocketCalls(addr, ws);
    }
  } else {
    setupSocketCalls(addr, ws);
  }
});

let setupSocketCalls = (ip: string, socket: any) => {
  let id: string;
  if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
    id = UserManager.getElectronUserID();
  } else {
    if (TSXSettings.getSettings().expressSettings.limit1Connection) {
      id = ip;
    } else {
      id = (ip + "|||" + connIndex);
      connIndex++;
    }
  }
  (socket as any)['userID'] = id;
  socketToUserID.set(socket, id);
  userIDToSocket.set(id, socket);
  socket.on('message', (data: any) => {
    if (data != undefined) {
      let pack = JSON.parse(data as string);
      if (pack.type == "callback") {
        callbackMessenger(socket, pack);
      } else if (pack.type == "screenSize") {
        setupScreenSize(id, pack);
      } else if (pack.type == "setup") {
        setupSocket(id, socket);
      }
    }
  });
  socket.on('close', () => {
    close(socket);
  });
}

let setupScreenSize = (userID: string, pack: any) => {
  ScreenSizeManager.setScreenSize(userID, {
    width: pack.width,
    height: pack.height
  });
}

let setupRenderer = (socket: any) => {
  let id: string = (socket as any)['userID'];
  if (UserManager.userIDToTsxID.has(id)) {
    tsxlight.transitionToPage(PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(id)), id);
  } else {
    tsxlight.transitionToPage(TSXSettings.getSettings().homepagePageID, id);
  }
}

let setupSocket = (ip: string, socket: any) => {
  setupRenderer(socket);
};

function close(socket: any) {
  if (!(socket.readyState == 2 || socket.readyState == 3)) {
    socket.send("<div style=\"display:flex;justify-content:center;align-content:center;\"><p style=\"font-size:24pt;padding-top:2em;font-weight:800;font-family:Arial;\">Connected on another tab. Refresh to reset the current tab as the app tab.</p></div>");
    socket.close();
    let x = socketToUserID.get(socket);
    if (x == undefined) {
      throw new Error("Socket disconnected that wasn't registered! With client id: " + (socket as any)['userID']);
    }
    socketToUserID.delete(socket);
    userIDToSocket.delete(x);
  }
}

function callbackMessenger(socket: any, cbPackage: CBPackage) {
  let usrID = (socket as any)['userID'] as string;
  let callbackID: string = "";
  callbackID += "/";
  callbackID += cbPackage.targetID;
  callbackID += "/";
  callbackID += cbPackage.eventType
  let currPageID = PageManager.getCurrentPageIDForTsxID(UserManager.getRendererIDForUserID(usrID));
  if (callbackID == "/tsxlight-body/onClick") {
    // Handle general onClick
    BaseHooks.callCallbacks(usrID, onClickHookID, cbPackage);
    CallbackManager.clearCallbacksForUserIDPageID(usrID, currPageID);
    tsxlight.rerender(usrID);
  } else {
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
}