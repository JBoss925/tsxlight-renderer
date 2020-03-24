import { TSXSettings, RenderMode } from "./settingsManager";

export class UserManager {

  private static electronConst = "electronUser"
  public static tsxToUserID = new Map<number, string>();
  public static userIDToTsxID = new Map<string, number>();
  public static tsxToLastUserID = new Map<number, string>();

  public static setUserIDForRenderer(tsxID: number, userID: string) {
    let beforeLen = this.tsxToUserID.size;
    let beforeVal = this.tsxToUserID.get(tsxID);
    this.tsxToUserID.delete(tsxID);
    let afterLen = this.tsxToUserID.size;
    if (afterLen < beforeLen) {
      this.userIDToTsxID.delete(beforeVal as string);
      this.tsxToLastUserID.set(tsxID, beforeVal as string);
    }
    this.tsxToUserID.set(tsxID, userID);
    this.userIDToTsxID.set(userID, tsxID);
  }
  public static getRendererIDForUserID(userID: string): number {
    let mapVal = this.userIDToTsxID.get(userID);
    if (mapVal == undefined) {
      throw new Error("Attempted to get current renderer for a userID: " + userID + " which isn't registered!");
    }
    return mapVal;
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
  public static getLastUserIDForRendererID(tsxID: number): string | undefined {
    if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
      return UserManager.electronConst;
    }
    let mapVal = this.tsxToLastUserID.get(tsxID);
    return mapVal;
  }
  public static getElectronUserID(): string {
    return this.electronConst;
  }
}