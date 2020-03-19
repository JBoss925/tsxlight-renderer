import { tsxlightinstance } from "../renderer/tsxRenderer";
import { Component } from "../tsxlight";
import { userIDToSocket } from "../server/serverHandler";

export class CallbackManager {

  public static userIDToIDToCallback: Map<string, Map<string, Function>> = new Map<string, Map<string, Function>>();
  public static userIDtoIDToThisArg: Map<string, Map<string, Function>> = new Map<string, Map<string, any>>();
  public static clearCallbacksForUserID(userID: string) {
    this.userIDToIDToCallback.delete(userID);
    this.userIDtoIDToThisArg.delete(userID);
  }
  public static getCallback(userID: string, callbackID: string): Function {
    if (this.userIDToIDToCallback.has(userID)) {
      let x = this.userIDToIDToCallback.get(userID) as Map<string, Function>;
      if (x.has(callbackID)) {
        return x.get(callbackID) as Function;
      } else {
        throw new Error("Attempted to get callback for event: " + callbackID + " on userID: " + userID + " but none exists!");
      }
    } else {
      throw new Error("Attempted to get callback that didn't exist since userID: " + userID + " was not registered!");
    }
  }
  public static addCallback(userID: string, callbackID: string, callback: Function, thisArg?: any) {
    if (this.userIDToIDToCallback.has(userID)) {
      let x = this.userIDToIDToCallback.get(userID) as Map<string, Function>;
      x.set(callbackID, callback);
    } else {
      let newCallbackMap = new Map<string, Function>();
      newCallbackMap.set(callbackID, callback);
      let newThisMap = new Map<string, any>();
      newThisMap.set(callbackID, thisArg);
      this.userIDToIDToCallback.set(userID, newCallbackMap);
      this.userIDtoIDToThisArg.set(userID, newThisMap);
    }
  }
  public static callCallback(userID: string, callbackID: string) {
    if (!this.userIDToIDToCallback.has(userID)) {
      throw new Error("Callback not available for userID: " + userID);
    } else {
      let usersToCB = this.userIDToIDToCallback.get(userID) as Map<string, Function>;
      if (!usersToCB.has(callbackID)) {
        throw new Error("No callback with callback id: " + callbackID + " for userID: " + userID);
      }
      let callback = usersToCB.get(callbackID) as Function;
      let thisArg = this.userIDtoIDToThisArg.get(userID)?.get(callbackID);
      console.log("CB", callback, "thisArg", thisArg);
      callback.apply(thisArg);
    }
  }
  public static removeCallback(userID: string, callbackID: string) {
    if (this.userIDToIDToCallback.has(userID)) {
      let x = this.userIDToIDToCallback.get(userID) as Map<string, Function>;
      x.delete(callbackID);
      this.userIDtoIDToThisArg.get(userID)?.delete(callbackID);
    } else {
      throw new Error("Attempted to remove callback that didn't exist since userID: " + userID + " was not registered!");
    }
  }
}