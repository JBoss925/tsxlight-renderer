// usermanager

import { TSXSettings, RenderMode } from "./settingsManager";
import { tsxlightinstance } from "../renderer/tsxRenderer";

// currentUser -> user we're currently serving

// user -> current renderered elt ids and callbacks
// clear every rerender


export class UserManager {

  private static electronConst = "electronUser"
  public static tsxToUserID = new Map<number, string>();

  public static setUserIDForRenderer(tsxID: number, userID: string) {
    this.tsxToUserID.delete(tsxID);
    this.tsxToUserID.set(tsxID, userID);
  }
  public static getUserIDForRendererID(tsxID: number): string {
    if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
      return UserManager.electronConst;
    }
    let mapVal = this.tsxToUserID.get(tsxID);
    if (mapVal == undefined) {
      throw new Error("Attempted to get current user for a renderer ID: " + tsxID + " which isn't registered!");
    }
    return mapVal;
  }
  public static getElectronUserID(): string {
    return this.electronConst;
  }
}