import { Component, tsxlightinstance, tsxlight } from "./tsxlight";
import { StateManager } from "./stateManager";

export type PageCallback = (pageID: string, baseComponent: Component<any, any>) => any;

export type Page = {
  pageID: string,
  onLoadCallback: PageCallback,
  onUnloadCallback: PageCallback
}

export class PageManager {

  public constructor(tsxlightInstanceIn: tsxlightinstance) { this.tsxlightInstance = tsxlightInstanceIn; };
  public tsxlightInstance: tsxlightinstance;
  public static currentPageID: string = "NO PAGE ID";
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
  public saveStates(base: Component<any, any> | JSX.Element) {
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
  public loadStates(base: Component<any, any> | JSX.Element) {
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
  public transitionToPage(pageID: string) {
    let oldPageID = PageManager.currentPageID;
    if (oldPageID != "NO PAGE ID") {
      let oldPage = PageManager.idToPage.get(oldPageID);
      if (oldPage == undefined) {
        throw new Error("No page registered with id: " + pageID + "!");
      }
      let oldBaseComp = tsxlight.baseApp?.userApp;
      // console.log("PIOPIOPIOPIOP")
      // console.log(oldBaseComp?.props?.children[0]?.props?.children[0]?.props?.children[0]);
      if (oldBaseComp == undefined) {
        throw new Error("Unable to find base component for id: " + oldPageID);
      }
      this.saveStates(oldBaseComp);
      PageManager.idToBaseComponent.delete(oldPageID);
      PageManager.idToPage.delete(oldPageID);
      PageManager.idToPage.set(oldPageID, oldPage);
      PageManager.idToBaseComponent.set(oldPageID, oldBaseComp)
      oldPage.onUnloadCallback(oldPageID, oldBaseComp);
    }
    PageManager.currentPageID = pageID;
    let page = PageManager.idToPage.get(PageManager.currentPageID);
    if (page == undefined) {
      throw new Error("No page registered with id: " + pageID + "!");
    }
    let base = PageManager.idToBaseComponent.get(PageManager.currentPageID);
    // console.log("here ya go!");
    // console.log(base?.props?.children[0]?.props?.children[0]?.props?.children[0]);
    if (base == undefined) {
      throw new Error("No base component registered with id: " + pageID + "!");
    }
    PageManager.idToBaseComponent.delete(PageManager.currentPageID);
    PageManager.idToPage.delete(PageManager.currentPageID);
    PageManager.idToPage.set(PageManager.currentPageID, page);
    PageManager.idToBaseComponent.set(PageManager.currentPageID, base);
    this.tsxlightInstance.render();
    page.onLoadCallback(PageManager.currentPageID, base);
  }
  public static getCurrentPage(): Page {
    if (PageManager.currentPageID == "NO PAGE ID") {
      throw new Error("No current page yet!");
    }
    let currPage: Page | undefined = PageManager.idToPage.get(PageManager.currentPageID);
    if (currPage == undefined) {
      throw new Error("Couldn't find page in idToPage with id " + PageManager.currentPageID + "!");
    }
    return PageManager.idToPage.get(PageManager.currentPageID) as Page;
  }
  public static getCurrentBaseComponent(): Component<any, any> {
    let curr = PageManager.idToBaseComponent.get(PageManager.currentPageID);
    if (curr == undefined) {
      throw new Error("Unable to find page with id: " + PageManager.currentPageID);
    }
    // console.log("yeeeet");
    // console.log(curr?.props?.children[0]?.props?.children[0]?.props?.children[0]);
    return curr;
  }
  public rerenderCurrentPage() {
    // console.log("OOF");
    // console.log(PageManager.idToBaseComponent.get(PageManager.currentPageID) as Component<any, any>);
    this.transitionToPage(PageManager.currentPageID);
  }

}