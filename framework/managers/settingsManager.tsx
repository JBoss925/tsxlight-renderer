import { tsxlightinstance } from "../renderer/tsxRenderer";
import { app } from "electron";
const { screen } = require('electron');
import settingsJsonRaw from './../settings.json';

export type RawSettings = {
  // buildMode is either "dev", "desktopMac", "desktopWin", "desktopLin", "express"
  "buildMode": string,
  "homepagePageID": string,
  // baseURL is the base url of the server, without any slashes or protocols (no 'http://'), a good ex: is "google.com"
  "baseURL": string,
  // Mode is either "electron" or "express"
  // Electron will build it for native, 
  "mode": string,
  "port": number,
  "socketPort": number,
  // For electron
  "electronSettings": {
    // Width and height must end in px or %
    "windowWidth": string,
    "windowHeight": string
  },
  "expressSettings": {
    // limit1Connection determines whether to inactivate old tabs when a new tab is opened on the site.
    "limit1Connection": boolean
  }
}

export enum RenderMode {
  ELECTRON, EXPRESS, NULL
}

export type ElectronSettings = {
  windowWidth: number,
  windowHeight: number
}

export type ExpressSettings = {
  limit1Connection: boolean
}

export type Settings = {
  buildMode: string,
  homepagePageID: string,
  baseURL: string,
  mode: RenderMode,
  port: number,
  socketPort: number,
  electronSettings: ElectronSettings,
  expressSettings: ExpressSettings
}

export class TSXSettings {

  public static settings: Settings;
  public static settingsInit: boolean = false;
  public static settingsStr: string = "";
  public static getSettings(): Settings {
    if (TSXSettings.settingsInit) {
      return TSXSettings.settings;
    } else {
      TSXSettings.loadSafeSettings();
      if (TSXSettings.settings.mode == RenderMode.EXPRESS) {
        TSXSettings.loadSettings();
      }
      TSXSettings.settingsInit = true;
      return TSXSettings.settings;
    }
  }
  // Load in raw settings
  public static rawSettings = require('./../settings.json') as RawSettings;
  public static getRenderMode(): RenderMode {
    let modeVal: RenderMode;
    if (TSXSettings.rawSettings.mode == "electron") {
      modeVal = RenderMode.ELECTRON;
    }
    else if (TSXSettings.rawSettings.mode == "express") {
      modeVal = RenderMode.EXPRESS;
    }
    else {
      modeVal = RenderMode.NULL;
    }
    return modeVal;
  }
  public static loadSafeSettings(): Settings {
    let modeVal = TSXSettings.getRenderMode();
    let elecSettings = { windowWidth: 720, windowHeight: 480 } as ElectronSettings;
    let exprSettings = TSXSettings.loadExpressSettings();
    let retVal: Settings = {
      buildMode: TSXSettings.rawSettings.buildMode,
      homepagePageID: TSXSettings.rawSettings.homepagePageID,
      baseURL: TSXSettings.rawSettings.baseURL,
      mode: modeVal,
      electronSettings: elecSettings,
      expressSettings: exprSettings,
      port: TSXSettings.rawSettings.port,
      socketPort: TSXSettings.rawSettings.socketPort
    };
    TSXSettings.settings = retVal;
    TSXSettings.settingsStr = JSON.stringify(TSXSettings.settings).replace(/\"/g, '\'');
    return retVal;
  }
  public static loadSettings(): Settings {
    let modeVal = TSXSettings.getRenderMode();
    let elecSettings;
    if (TSXSettings.rawSettings.mode == "electron") {
      elecSettings = TSXSettings.loadElectronSettings();
    }
    let exprSettings = TSXSettings.loadExpressSettings();
    let retVal: Settings = {
      buildMode: TSXSettings.rawSettings.buildMode,
      homepagePageID: TSXSettings.rawSettings.homepagePageID,
      baseURL: TSXSettings.rawSettings.baseURL,
      mode: modeVal,
      electronSettings: elecSettings as ElectronSettings,
      expressSettings: exprSettings,
      port: TSXSettings.rawSettings.port,
      socketPort: TSXSettings.rawSettings.socketPort
    };
    TSXSettings.settings = retVal;
    TSXSettings.settingsStr = JSON.stringify(TSXSettings.settings).replace(/\"/g, '\'');
    return retVal;
  }
  public static loadElectronSettings(): ElectronSettings {
    let elecRaw = TSXSettings.rawSettings.electronSettings;
    let elecSetRet = {} as ElectronSettings;
    if (elecRaw.windowHeight.endsWith("%") && (Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 1)) != undefined) && !isNaN(Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 1)))) {
      // We're a percent value, convert from screen size
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      let val = (Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 1)) / 100.0) * height;
      elecSetRet.windowHeight = val;
    } else if (elecRaw.windowHeight.endsWith("px") && (Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 2)) != undefined) && !isNaN(Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 2)))) {
      // We're a pixel value, directly map it
      elecSetRet.windowHeight = Number(elecRaw.windowHeight.substr(0, elecRaw.windowHeight.length - 2));
    } else {
      throw new Error("Invalid value for electron windowHeight in settings.json!");
    }
    if (elecRaw.windowWidth.endsWith("%") && (Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 1)) != undefined) && !isNaN(Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 1)))) {
      // We're a percent value, convert from screen size
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      let val = (Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 1)) / 100.0) * width;
      elecSetRet.windowWidth = val;
    } else if (elecRaw.windowWidth.endsWith("px") && (Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 2)) != undefined) && !isNaN(Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 2)))) {
      // We're a pixel value, directly map it
      elecSetRet.windowWidth = Number(elecRaw.windowWidth.substr(0, elecRaw.windowWidth.length - 2));
    } else {
      throw new Error("Invalid value for electron windowWidth in settings.json!");
    }
    return elecSetRet;
  }
  public static loadExpressSettings(): ExpressSettings {
    return {
      limit1Connection: TSXSettings.rawSettings.expressSettings.limit1Connection
    };
  }

}