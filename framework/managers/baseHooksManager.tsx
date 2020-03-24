import { CBPackage } from "../types/types";

export class BaseHooks {

  public static userIDToHookIDToCallbacks: Map<string, Map<string, Map<string, Function>>> = new Map<string, Map<string, Map<string, Function>>>();

  public static callCallbacks(userID: string, hookID: string, event: CBPackage) {
    let x = this.userIDToHookIDToCallbacks.get(userID);
    if (x == undefined) {
      throw new Error("Couldn't get callback with userID: " + userID + ", hookID: " + hookID);
    }
    let y = x.get(hookID);
    if (y == undefined) {
      throw new Error("Couldn't get callback with userID: " + userID + ", hookID: " + hookID);
    }
    for (let func of y.values()) {
      func(event);
    }
  }

  public static registerCallback(userID: string, hookID: string, compPath: string, cb: Function) {
    let x = this.userIDToHookIDToCallbacks.get(userID);
    if (x == undefined) {
      let newHookMap = new Map<string, Map<string, Function>>();
      let compMap = new Map<string, Function>();
      compMap.set(compPath, cb);
      newHookMap.set(hookID, compMap);
      this.userIDToHookIDToCallbacks.set(userID, newHookMap);
      return;
    }
    let y = x.get(hookID);
    if (y == undefined) {
      let compMap = new Map<string, Function>();
      compMap.set(compPath, cb);
      x.set(hookID, compMap);
      return;
    }
    let z = y.get(compPath);
    if (z == undefined) {
      y.set(compPath, cb);
      return;
    }
    y.set(compPath, cb);
  }

  public static unregisterCallback(userID: string, hookID: string, compPath: string) {
    let x = this.userIDToHookIDToCallbacks.get(userID);
    if (x == undefined) {
      return;
    }
    let y = x.get(hookID);
    if (y == undefined) {
      return;
    }
    let z = y.get(compPath);
    if (z == undefined) {
      return;
    }
    y.delete(compPath);
  }

}