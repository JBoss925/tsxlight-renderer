import { TSXSettings } from "./settingsManager";

export type ScreenSize = {
  width: number,
  height: number
}

export class ScreenSizeManager {

  public static userIDToScreenSize = new Map<string, ScreenSize>();

  public static setScreenSize(userID: string, screenSize: ScreenSize) {
    this.userIDToScreenSize.set(userID, screenSize);
  }

  public static getScreenSize(userID: string) {
    let x = this.userIDToScreenSize.get(userID);
    if (x == undefined) {
      return {
        width: TSXSettings.getSettings()?.electronSettings?.windowWidth ? TSXSettings.getSettings()?.electronSettings?.windowWidth : 1920,
        height: TSXSettings.getSettings()?.electronSettings?.windowHeight ? TSXSettings.getSettings()?.electronSettings?.windowHeight : 1080
      };
    }
    return x;
  }

}