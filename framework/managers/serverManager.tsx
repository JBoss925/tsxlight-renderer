import { Request, Response } from 'express';
import { tsxlight } from '../tsxlight';
import { TSXSettings } from './settingsManager';
import { Express } from 'express';
import express from 'express';
import socketio from 'socket.io';
import { server } from 'websocket';

export class ServerManager {

  static isInit = false;
  static app: Express;
  static port: number;
  static socketPort: number;
  static wsServer: server;

  public static init() {
    if (!ServerManager.isInit) {
      const app = express();
      const serverInst = require('http').createServer(app);
      let envProc: any;
      if (TSXSettings.getSettings().preferProcessPort) {
        envProc = process.env.PORT;
      }
      let portV;
      if (envProc == undefined) {
        portV = TSXSettings.getSettings().port || 8080;
      } else {
        portV = envProc;
      }
      const port = portV;
      let portSockV;
      if (envProc == undefined) {
        portSockV = TSXSettings.getSettings().socketPort || 1234;
      } else {
        portSockV = envProc;
      }
      const socketPort = portSockV;
      serverInst.listen(socketPort, () => console.log(`WS listening on port ${socketPort}!`));
      app.listen(port, () => console.log(`App listening on port ${port}!`))
      const wsServ = new server({
        httpServer: serverInst
      });
      ServerManager.wsServer = wsServ;
      ServerManager.app = app;
      ServerManager.port = port;
      ServerManager.socketPort = socketPort;
      ServerManager.isInit = true;

    }
  }

}