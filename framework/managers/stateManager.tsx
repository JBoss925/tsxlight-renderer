import { Component } from "../tsxlight";

export type PageCallback = (pageID: string, baseComponent: Component<any, any>) => any;

export type Page = {
  pageID: string,
  onLoadCallback: PageCallback,
  onUnloadCallback: PageCallback
}

export class StateManager {

  public static compToState: Map<string, any> = new Map<string, any>();
  public static stateHasInit: Map<string, boolean> = new Map<string, boolean>();
  public static registerCompStateInit(path: string) {
    this.stateHasInit.delete(path);
    this.stateHasInit.set(path, true);
  }
  public static unregisterCompStateInit(path: string) {
    this.stateHasInit.delete(path);
    this.stateHasInit.set(path, false);
  }
  public static compStateHasInit(path: string) {
    let ret = this.stateHasInit.get(path);
    if (ret == undefined) {
      return false;
    }
    return ret;
  }
  public static setCompState(path: string, state: any) {
    if (state == undefined) {
      if (this.compToState.has(path)) {
        this.compToState.delete(path);
      }
      return;
    }
    this.compToState.delete(path);
    this.compToState.set(path, state);
  }
  public static getCompState(path: string) {
    let ret = this.compToState.get(path);
    return ret;
  }
}