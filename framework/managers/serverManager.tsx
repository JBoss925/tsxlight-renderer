import { TSXSettings } from './settingsManager';
import { Express } from 'express';
import express from 'express';
import expressws from 'express-ws';

export class ServerManager {

  static isInit = false;
  static app: Express;
  static port: number;
  static wsServer: expressws.Instance;

  public static init() {
    if (!ServerManager.isInit) {
      const app = express();
      const wsServer = expressws(app);
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
      app.listen(port, () => console.log(`App listening on port ${port}!`))
      ServerManager.wsServer = wsServer;
      ServerManager.app = app;
      ServerManager.port = port;
      ServerManager.isInit = true;
    }
  }

}