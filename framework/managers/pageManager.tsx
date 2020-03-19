import { tsxlight, Component } from "../tsxlight";
import { StateManager } from "./stateManager";
import { tsxlightinstance } from "../renderer/tsxRenderer";
import { UserManager } from "./userManager";

export type PageCallback = (pageID: string, baseComponent: Component<any, any>) => any;

export type Page = {
  pageID: string,
  onLoadCallback: PageCallback,
  onUnloadCallback: PageCallback
}

export class PageManager {

  public static tsxIDToTsx: Map<number, tsxlightinstance> = new Map();
  public static tsxIDToCurrentPageID: Map<number, string> = new Map();
  public static getTsxForTsxID(tsxID: number): tsxlightinstance {
    let x = this.tsxIDToTsx.get(tsxID);
    if (x == undefined) {
      throw new Error("Unable to find tsx instance with id: " + tsxID + "!");
    }
    return x;
  }
  public static setTsxForTsxID(tsxID: number, tsx: tsxlightinstance) {
    this.tsxIDToTsx.delete(tsxID);
    this.tsxIDToTsx.set(tsxID, tsx);
  }
  public static getCurrentPageIDForTsxID(tsxID: number): string {
    let x = this.tsxIDToCurrentPageID.get(tsxID);
    if (x == undefined) {
      return "NO PAGE ID";
    }
    return x;
  }
  public static setCurrentPageIDForTsxID(tsxID: number, currPageID: string) {
    this.tsxIDToCurrentPageID.delete(tsxID);
    this.tsxIDToCurrentPageID.set(tsxID, currPageID);
  }
  public static idToPage: Map<string, Page> = new Map<string, Page>();
  public static idToBaseComponent: Map<string, Component<any, any>> = new Map<string, Component<any, any>>();
  public static addPage(pageID: string, baseComponent: Component<any, any>, onLoadPage: PageCallback, onUnloadPage: PageCallback) {
    PageManager.idToBaseComponent.set(pageID, baseComponent);
    PageManager.idToPage.set(pageID, {
      pageID: pageID,
      onLoadCallback: onLoadPage,
      onUnloadCallback: onUnloadPage
    } as Page);
  }
  public static removePage(pageID: string) {
    PageManager.idToPage.delete(pageID);
  }
  public static saveStates(base: Component<any, any> | JSX.Element) {
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So save state!
        (child as Component<any, any>).saveState();
        this.saveStates(child);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.saveStates(child);
      }
    }
  }
  public static loadStates(base: Component<any, any> | JSX.Element) {
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So load state!
        (child as Component<any, any>).loadState();
        this.loadStates(child);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.loadStates(child);
      }
    }
  }
  public static transitionToPage(tsxID: number, pageID: string) {
    let tsxlightInstance = PageManager.getTsxForTsxID(tsxID);
    let oldPageID = PageManager.getCurrentPageIDForTsxID(tsxID);
    if (oldPageID != "NO PAGE ID") {
      if (oldPageID == pageID && UserManager.getUserIDForRendererID(tsxID) == UserManager.getLastUserIDForRendererID(tsxID)) {
        tsxlightInstance.render();
        return;
      }
      let oldPage = PageManager.idToPage.get(oldPageID);
      if (oldPage == undefined) {
        throw new Error("No page registered with id: " + pageID + "!");
      }
      let oldBaseComp = tsxlight.getInstanceFromTSX(tsxID).baseApp?.userApp;
      if (oldBaseComp == undefined) {
        throw new Error("Unable to find base component for id: " + oldPageID);
      }
      PageManager.saveStates(oldBaseComp);
      PageManager.idToBaseComponent.delete(oldPageID);
      PageManager.idToPage.delete(oldPageID);
      PageManager.idToPage.set(oldPageID, oldPage);
      PageManager.idToBaseComponent.set(oldPageID, oldBaseComp)
      oldPage.onUnloadCallback(oldPageID, oldBaseComp);
    }
    PageManager.setCurrentPageIDForTsxID(tsxlightInstance.instanceID, pageID);
    let page = PageManager.idToPage.get(pageID);
    if (page == undefined) {
      throw new Error("No page registered with id: " + pageID + "!");
    }
    let base = PageManager.idToBaseComponent.get(pageID);
    if (base == undefined) {
      throw new Error("No base component registered with id: " + pageID + "!");
    }
    PageManager.idToBaseComponent.delete(pageID);
    PageManager.idToPage.delete(pageID);
    PageManager.idToPage.set(pageID, page);
    PageManager.idToBaseComponent.set(pageID, base);
    tsxlightInstance.render();
    page.onLoadCallback(pageID, base);
  }
  public static getCurrentBaseComponent(tsxID: number): Component<any, any> {
    let curr = PageManager.idToBaseComponent.get(PageManager.getCurrentPageIDForTsxID(tsxID));
    if (curr == undefined) {
      throw new Error("Unable to find current base component for renderer with id: " + tsxID);
    }
    return curr;
  }
  public static rerenderCurrentPage(tsxID: number) {
    PageManager.transitionToPage(tsxID, PageManager.getCurrentPageIDForTsxID(tsxID));
  }

}