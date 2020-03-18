import { Request, Response } from 'express';
import { tsxlight } from '../tsxlight';
import { TSXSettings } from './settingsManager';

export class ServerManager {

  static isInit = false;
  static app: Express.Application;
  static port: number;
  static io: any;

  public static init() {
    if (!ServerManager.isInit) {
      const express = require('express');
      const app = express();
      const server = require('http').createServer(app);
      const port = TSXSettings.getSettings().port || 3000;
      const io = require('socket.io')(server);
      ServerManager.io = io;
      ServerManager.app = app;
      ServerManager.port = port;
      io.on('connection', () => { /* … */ });
      server.listen(TSXSettings.getSettings().socketPort || 8000);
      app.listen(port, () => console.log(`App listening on port ${port}!`))
      ServerManager.isInit = true;

    }
  }

}