import { tsxlightinstance } from "../renderer/tsxRenderer";
import { Component } from "../tsxlight";
import { userIDToSocket } from "../server/serverHandler";
import { inspect } from 'util';

export class CallbackManager {

  public static userIDToPageToCallback: Map<string, Map<string, Map<string, Function>>> = new Map<string, Map<string, Map<string, Function>>>();
  public static userIDtoPageToThisArg: Map<string, Map<string, Map<string, any>>> = new Map<string, Map<string, Map<string, any>>>();
  public static clearCallbacksForUserIDPageID(userID: string, pageID: string) {
    this.userIDToPageToCallback.get(userID)?.delete(pageID);
    this.userIDtoPageToThisArg.get(userID)?.delete(pageID);
  }
  public static getCallback(userID: string, pageID: string, callbackID: string): Function {
    if (this.userIDToPageToCallback.has(userID)) {
      let z = this.userIDToPageToCallback.get(userID) as Map<string, Map<string, Function>>;
      if (!z.has(pageID)) {
        throw new Error("Tried to get callback for userID: " + userID + " on a pageID that doesn't exist! pageID: " + pageID);
      }
      let x = z.get(pageID) as Map<string, Function>;
      if (x.has(callbackID)) {
        return x.get(callbackID) as Function;
      } else {
        throw new Error("Attempted to get callback for event: " + callbackID + " on userID: " + userID + " but none exists!");
      }
    } else {
      throw new Error("Attempted to get callback that didn't exist since userID: " + userID + " was not registered!");
    }
  }
  public static addCallback(userID: string, pageID: string, callbackID: string, callback: Function, thisArg?: any) {
    if (this.userIDToPageToCallback.has(userID)) {
      let z = this.userIDToPageToCallback.get(userID) as Map<string, Map<string, Function>>;
      let m = this.userIDtoPageToThisArg.get(userID) as Map<string, Map<string, any>>;
      if (!z.has(pageID)) {
        let newPageCallbacks = new Map<string, Function>();
        let newPageThisArgs = new Map<string, any>();
        newPageCallbacks.set(callbackID, callback);
        newPageThisArgs.set(callbackID, thisArg);
        z.set(pageID, newPageCallbacks);
        m.set(pageID, newPageThisArgs);
        return;
      }
      let x = z.get(pageID) as Map<string, Function>;
      let y = m.get(pageID) as Map<string, any>;
      x.set(callbackID, callback);
      y.set(callbackID, thisArg);
    } else {
      let newPageMap = new Map<string, Map<string, Function>>();
      let newCallbackMap = new Map<string, Function>();
      newCallbackMap.set(callbackID, callback);
      newPageMap.set(pageID, newCallbackMap);
      let newPageThisMap = new Map<string, Map<string, any>>();
      let newThisMap = new Map<string, any>();
      newThisMap.set(callbackID, thisArg);
      newPageThisMap.set(pageID, newThisMap);
      this.userIDToPageToCallback.set(userID, newPageMap);
      this.userIDtoPageToThisArg.set(userID, newPageThisMap);
    }
  }
  public static callCallback(userID: string, pageID: string, callbackID: string) {
    if (!this.userIDToPageToCallback.has(userID)) {
      throw new Error("Callback not available for userID: " + userID);
    } else {
      let pagesToCBs = this.userIDToPageToCallback.get(userID) as Map<string, Map<string, Function>>;
      if (!pagesToCBs.has(pageID)) {
        throw new Error("No callbacks for userID: " + userID + " on pageID: " + pageID);
      }
      let cbIDtoCallback = pagesToCBs.get(pageID) as Map<string, Function>;
      if (!cbIDtoCallback.has(callbackID)) {
        throw new Error("No callbacks for userID: " + userID + " on pageID: " + pageID + " with callbackID: " + callbackID);
      }
      let callback = cbIDtoCallback.get(callbackID) as Function;
      let thisArg = this.userIDtoPageToThisArg.get(userID)?.get(pageID)?.get(callbackID);
      callback.apply(thisArg);
    }
  }
  public static removeCallback(userID: string, pageID: string, callbackID: string) {
    if (this.userIDToPageToCallback.has(userID)) {
      let x = this.userIDToPageToCallback.get(userID) as Map<string, Map<string, Function>>;
      let pageMap = x.get(pageID) as Map<string, Function>;
      pageMap.delete(callbackID);
      this.userIDtoPageToThisArg.get(userID)?.delete(callbackID);
    } else {
      throw new Error("Attempted to remove callback that didn't exist since userID: " + userID + " was not registered!");
    }
  }
}