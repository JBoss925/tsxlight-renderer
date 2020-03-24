// 5 things in this file:
//   - Builds the electron window
//   - The renderer manager
//   - The Component<P,S> base class
//   - BaseAppComponent
//   - Start the server handler


// Start file end!
const fs = require('fs');
import { TSXSettings, RenderMode } from './managers/settingsManager';
import { ServerManager } from './managers/serverManager';
ServerManager.init();

// Start the server handler
require('./server/serverHandler');

if (TSXSettings.getRenderMode() == RenderMode.EXPRESS) {
  TSXSettings.loadSettings();
} else if (TSXSettings.getRenderMode() == RenderMode.ELECTRON) {
  const { app } = require('electron');
  app.on('ready', createWindow);
}

function writeTemplateHTML() {
  let init = fs.readFileSync('template/templateInitElectron.html').toString();
  let x = '<meta id="tsxlight-settings" name="tsxlight-settings" content="' + JSON.stringify(TSXSettings.getSettings()).replace(/\"/g, "\'") + '"></meta>'
  let newTemp = init.replace('<meta id="tsxlight-settings" name="tsxlight-settings" content="">', x);
  fs.writeFileSync('template/templateTempElectron.html', newTemp);
}
writeTemplateHTML();

// TSX HTML Window Setup START -------------------------------------------------

import { BrowserWindow } from 'electron';
import { StateManager, PageCallback } from './managers/stateManager';
import { tsxlightinstance } from './renderer/tsxRenderer';
import { UserManager } from './managers/userManager';
import { PageManager } from './managers/pageManager';
import { DOMTreeTypesDef, JSXGenElType, DOMTreeTypes, PropsType, RenderReturnType } from './types/types';
import { ScreenSizeManager, ScreenSize } from './managers/screenSizeManager';
import { InternalEventManager } from './managers/internalEventManager';
import { BaseHooks } from './managers/baseHooks';
import { onClickHookID } from './constants/constants';

export let window: BrowserWindow;
let windowShowRes: Function;
function createWindow() {
  TSXSettings.loadSettings();
  ScreenSizeManager.setScreenSize(UserManager.getElectronUserID(), {
    width: TSXSettings.getSettings().electronSettings.windowWidth,
    height: TSXSettings.getSettings().electronSettings.windowHeight
  });
  let temp = fs.readFileSync('template/templateTempElectron.html');
  fs.writeFileSync('template/users/template_electronUser.html', temp);
  // Create the browser window.     
  window = new BrowserWindow({
    width: TSXSettings.getSettings().electronSettings.windowWidth,
    height: TSXSettings.getSettings().electronSettings.windowHeight,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // and load the html of the app.
  window.loadFile('template/users/template_electronUser.html');
  (window as any).openDevTools();
  refreshWindow();
  windowShowRes("ready");
}
export let showWindow = () => { windowShown = windowShown.then(() => window.show()); };
export let hideWindow = () => { windowShown = windowShown.then(() => window.hide()) };
export let refreshWindow = () => { windowShown = windowShown.then(() => window.reload()); };
let windowShown: Promise<any> = new Promise<any>((res, rej) => {
  windowShowRes = res;
});

// TSX HTML Window Setup END ---------------------------------------------------

class TsxlightRenderManager {
  i = 0;
  constructor() { };
  userIDtoRenderer: Map<string, tsxlightinstance> = new Map();
  tsxIDtoUserID: Map<number, string> = new Map();
  public transitionToPage(pageID: string, userID?: string) {
    if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
      userID = UserManager.getElectronUserID();
    }
    if (userID == undefined) {
      throw new Error("userID undefined! Calling tsxlight.transitionToPage(pageID: string, userID?: string) [i.e. from outside"
        + " a component, not using the component.transitionToPage(pageID: string) function] while the express render mode is set in the settings.json"
        + " file requires you to pass the optional userID parameter!");
    }
    if (this.userIDtoRenderer.has(userID)) {
      let rend = this.userIDtoRenderer.get(userID) as tsxlightinstance;
      rend.transitionToPage(pageID);
    } else {
      UserManager.setUserIDForRenderer(this.i, userID);
      let x = new tsxlightinstance(this.i);
      this.userIDtoRenderer.set(userID, x);
      this.tsxIDtoUserID.set(this.i, userID);
      this.i++;
      x.transitionToPage(pageID);
    }
  }
  public registerPage(pageID: string, baseComponent: Component<any, any> | JSX.Element, onLoadPage: PageCallback, onUnloadPage: PageCallback) {
    if (!(baseComponent instanceof Component)) {
      throw new Error("Tried to add page with root that isn't a component!")
    }
    PageManager.addPage(pageID, baseComponent, onLoadPage, onUnloadPage);
  }
  public unregisterPage(pageID: string) {
    PageManager.removePage(pageID);
  }
  public rerender(userID: string) {
    if (this.userIDtoRenderer.has(userID)) {
      let rend = this.userIDtoRenderer.get(userID) as tsxlightinstance;
      rend.rerender();
    } else {
      UserManager.setUserIDForRenderer(this.i, userID);
      let x = new tsxlightinstance(this.i);
      this.userIDtoRenderer.set(userID, x);
      this.tsxIDtoUserID.set(this.i, userID);
      this.i++;
      x.rerender();
    }
  }
  public getInstanceFromUser(userID: string): tsxlightinstance {
    if (!this.userIDtoRenderer.has(userID)) {
      throw new Error("No instance for userID: " + userID + "!");
    }
    return this.userIDtoRenderer.get(userID) as tsxlightinstance;
  }
  public getInstanceFromTSX(tsxID: number): tsxlightinstance {
    if (!this.tsxIDtoUserID.has(tsxID)) {
      throw new Error("No userID for tsxID: " + tsxID + "!");
    }
    return this.getInstanceFromUser(this.tsxIDtoUserID.get(tsxID) as string);
  }
  public createElement(tagType: any, props: any, ...value: any[]): JSX.Element {
    if (props == undefined || props == null) {
      props = {};
    }
    if (props.children == undefined || props.children == null) {
      props.children = props.children ? props.children : [];
    }
    if (!(value.length == 0 || value[0] == undefined || value[0] == null)) {
      props.children.push(...value);
    }
    if (typeof (tagType) == "string") {
      let element = { type: tagType, props: props, key: props.id ? props.id : null } as JSX.Element;
      return element;
    }
    // if (typeof (tagType) == "function") 
    else {
      let element = new tagType(props, {} as any, props.id ? props.id : null) as JSX.Element;
      return element;
    }
  }
}

export let tsxlight = new TsxlightRenderManager();

// TSX Renderer END ------------------------------------------------------------


export class Events {

  public static registerForOnClick(userID: string, callback: Function, componentPath: string) {
    BaseHooks.registerCallback(userID, onClickHookID, componentPath, callback);
  }

  public static unregisterForOnClick(userID: string, componentPath: string) {
    BaseHooks.unregisterCallback(userID, onClickHookID, componentPath);
  }

}


// Component base START --------------------------------------------------------

export abstract class Component<P, S> implements JSX.ElementClass {
  public type: any = this.constructor.name;
  public currentPath: string = "NO CURRENT PATH SET";
  public props: P & PropsType;
  public state: any;
  public renderedChildren: ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = [];
  public key: string | number | null | undefined;
  abstract render(): RenderReturnType;
  public events = Events;
  public getUserID(): string {
    return this.currentPath.split("/")[1];
  }
  public getScreenSize(): ScreenSize {
    return ScreenSizeManager.getScreenSize(this.getUserID());
  }
  public transitionToPage(pageID: string) {
    tsxlight.transitionToPage(pageID, this.getUserID());
  }
  public registerForEvent(tag: string, callback: ((event: any) => any), id?: string) {
    InternalEventManager.registerForEvent(this.getUserID(), tag, callback, id);
  }
  public pushEvent(tag: string, event: any) {
    InternalEventManager.pushEvent(this.getUserID(), tag, event);
  }
  public renderChildren: (currPath?: string, tsx?: tsxlightinstance) => ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = (currPath?: string, tsx?: tsxlightinstance) => {
    if (currPath == undefined) {
      let z = Array.from((PageManager.pageIdToTsxIDToComponent.get(PageManager.getCurrentPageIDForTsxID(tsx?.instanceID as number)) as Map<number, Component<any, any>>).values()).filter(x => x.type == this.type);
      currPath = '/' + UserManager.getUserIDForRendererID(tsx?.instanceID as number) + '/' + PageManager.getCurrentPageIDForTsxID(tsx?.instanceID as number) + '/[' + (z.length - 1) + ']' + this.type;
      this.currentPath = currPath;
    }
    this.renderedChildren = [];
    let rendVal = this.render();

    if (!(rendVal instanceof Component) && (rendVal as any).type == undefined && (rendVal as any).props == undefined) {
      // Do nothing!
      // We're an any type!
      this.renderedChildren.push(rendVal);
    } else if (!(rendVal instanceof Component)) {
      // We're an element! So render children!
      let renderElChil = ((thisArg: any) => {
        if (typeof (thisArg) == "string" || typeof (thisArg) == "number" || typeof (thisArg) == "undefined") {
          if (typeof (thisArg) == "undefined") {
            throw new Error("Undefined element child!");
          }
          return [thisArg];
        }
        thisArg['renderedChildren'] = [];
        if (thisArg.props == undefined) {
          return thisArg['renderedChildren'];
        }
        for (let n = 0; n < (thisArg as any).props.children.length; n++) {
          let x = (thisArg as any).props.children[n];
          if (Array.isArray(x)) {
            for (let z = 0; z < x.length; z++) {
              let y = x[z];
              if (y instanceof Component) {
                y['renderedChildren'] = [];
                (y as Component<any, any>).currentPath = currPath + '/[' + z + ']' + (y as Component<any, any>).type;
                (y as Component<any, any>).init();
                (thisArg as any)['renderedChildren'].push(...y.renderChildren(currPath));
              } else if (!(y instanceof Component) && (y as any).type == undefined && (y as any).props == undefined) {
                (thisArg as any)['renderedChildren'].push(y);
              } else {
                y['renderedChildren'] = [];
                renderElChil(y);
                (thisArg as any)['renderedChildren'].push(y);
              }
            }
          } else {
            if (x instanceof Component) {
              x['renderedChildren'] = [];
              (x as Component<any, any>).currentPath = currPath + '/[' + n + ']' + (x as Component<any, any>).type;
              (x as Component<any, any>).init();
              (thisArg as any)['renderedChildren'].push(...x.renderChildren(currPath));
            } else if (!(x instanceof Component) && (x as any).type == undefined && (x as any).props == undefined) {
              (thisArg as any)['renderedChildren'].push(x);
            } else {
              x['renderedChildren'] = [];
              renderElChil(x);
              (thisArg as any)['renderedChildren'].push(x);
            }
          }
        }
        return (thisArg as any)['renderedChildren'] as JSX.Element[];
      });
      renderElChil(rendVal);
      this.renderedChildren.push(rendVal);
      return this.renderedChildren;
    }
    let x = (rendVal as any).props.children;
    if (Array.isArray(x)) {
      this.props.children = x;
    } else {
      this.props.children = [x];
    }
    let childrenCopy = this.props.children;
    if (!Array.isArray(childrenCopy)) {
      this.doRecurseInst(childrenCopy, currPath, 0);
      return this.renderedChildren;
    }
    for (let i = 0; i < childrenCopy.length; i++) {
      if (Array.isArray(childrenCopy[i])) {
        for (let n = 0; n < (childrenCopy[i] as Array<any>).length; n++) {
          this.doRecurseInst((childrenCopy[i] as Array<any>)[n] as any, currPath, n);
        }
      }
      else {
        this.doRecurseInst(childrenCopy[i] as any, currPath, i);
      }
    }
    return this.renderedChildren;
  }
  private doRecurseInst(child: DOMTreeTypes, currPath: string, i: number) {
    // If it's a value
    if (!(child instanceof Component) && (child as any).type == undefined && (child as any).props == undefined) {
      // Do nothing!
      this.renderedChildren.push(child);
    } else if (child instanceof Component) {
      // We're a component! So render children!
      (child as Component<any, any>).currentPath = currPath + '/[' + i + ']' + (child as Component<any, any>).type;
      (child as Component<any, any>).init();
      this.renderedChildren.push(...(child as Component<any, any>).renderChildren((child as Component<any, any>).currentPath));
    } else {
      // We're an element!
      // Render and recurse
      (child as any)['renderedChildren'] = [];
      let childrenCopy = (child as any).props.children ? (child as any).props.children : [];
      let renderElChil = ((thisArg: any) => {
        if (!(thisArg instanceof Component) && (thisArg as any).type == undefined && (thisArg as any).props == undefined) {
          if (typeof (thisArg) == "undefined") {
            throw new Error("Undefined element child!");
          }
          return [thisArg];
        }
        thisArg['renderedChildren'] = [];
        for (let n = 0; n < (thisArg as any).props.children.length; n++) {
          let x = (thisArg as any).props.children[n];
          if (x instanceof Component) {
            x['renderedChildren'] = [];
            (x as Component<any, any>).currentPath = currPath + '/[' + n + ']' + (x as Component<any, any>).type;
            (x as Component<any, any>).init();
            (thisArg as any)['renderedChildren'].push(...x.renderChildren(currPath));
          } else if (!(x instanceof Component) && (x as any).type == undefined && (x as any).props == undefined) {
            (thisArg as any)['renderedChildren'].push(x);
          } else {
            x['renderedChildren'] = [];
            renderElChil(x);
            // (x as any)['renderedChildren'].push(...renderElChil(x));
            (thisArg as any)['renderedChildren'].push(x);
          }
        }
        return (thisArg as any)['renderedChildren'] as JSX.Element[];
      });
      this.renderedChildren.push(...renderElChil(child) as JSX.Element[]);
      // for (let rChild of childrenCopy) {
      //   if (rChild instanceof Component) {
      //     (rChild as Component<any, any>).init();
      //     (child as any).renderedChildren.push(...(rChild as Component<any, any>).renderChildren());
      //   } else {
      //     (child as any).renderedChildren.push(rChild);
      //   }
      // }
      // this.renderedChildren.push(child);
    }
  }
  public constructor(props: P, state: S, key: string | number | null | undefined) {
    if ((props as any).children != undefined) {
      this.props = props as P & PropsType;
    } else {
      this.props = { ...props, children: [] };
    }
    this.key = key;
  }
  context: any = Component.constructor.name;
  public init() { };
  public afterRender() { };
  initState<K extends never>(state: any, callback?: (() => void) | undefined): void {
    if (StateManager.compStateHasInit(this.currentPath)) {
      this.loadState();
    } else {
      this.state = state;
      this.saveState();
    }
    callback ? callback() : (() => { })();
  }
  saveState<K extends never>(callback?: (() => void) | undefined): void {
    if (this.currentPath == "NO CURRENT PATH SET") {
      throw new Error("Path not set before setting state!");
    }
    if (this.state == undefined) {
      return;
    }
    StateManager.setCompState(this.currentPath, this.state);
    StateManager.registerCompStateInit(this.currentPath);
    callback ? callback() : (() => { })();
  }
  loadState<K extends never>(callback?: (() => void) | undefined): void {
    if (this.currentPath == "NO CURRENT PATH SET") {
      throw new Error("Path not set before setting state!");
    }
    if (StateManager.compToState.has(this.currentPath)) {
      this.state = StateManager.getCompState(this.currentPath);
    }
    callback ? callback() : (() => { })();
  }
  private rerender() {
    tsxlight.rerender(this.getUserID());
  }
  setState<K extends never>(state: any, callback?: (() => void) | undefined): void {
    this.state = state;
    this.saveState();
    this.rerender();
    callback ? callback() : (() => { })();
  }
  forceUpdate(callback?: (() => void) | undefined): void {
    this.rerender();
    callback ? callback() : (() => { })();
  }
  public refs: { [key: string]: any; } = {};
}

// Component base END ----------------------------------------------------------

// BaseAppComonent START -------------------------------------------------------
export class BaseAppComponent extends Component<any, any>{

  public userApp: Component<any, any>;
  public tsxlightInstance: tsxlightinstance;

  public constructor(userBaseComp: Component<any, any>, tsx: tsxlightinstance, props: any, state: any, key?: string | number | null) {
    super(props, state, key);
    this.props.children = [];
    this.props.children = [userBaseComp];
    this.userApp = userBaseComp;
    this.tsxlightInstance = tsx;
  }

  init() { };

  public hasRenderedApp = false;

  public render() {
    if (!this.hasRenderedApp) {
      return { type: "baseApp", props: { children: [] } } as JSX.Element;
    } else {
      return this.userApp.render();
    }
  }

  public renderApp() {
    this.renderedChildren = [];
    let currPath = '/' + UserManager.getUserIDForRendererID(this.tsxlightInstance.instanceID as number) + '/' + PageManager.getCurrentPageIDForTsxID(this.tsxlightInstance.instanceID as number);
    this.userApp.currentPath = currPath + '/' + this.userApp.type
    this.userApp.renderChildren(this.userApp.currentPath, this.tsxlightInstance);
    this.hasRenderedApp = true;
    return this.userApp;
  }

  public setChild(comp: Component<any, any>) {
    this.userApp = comp;
    this.props.children = [];
    this.props.children.push(comp);
  }

  public getChild() {
    return this.userApp;
  }

}

// BaseAppComonent END ---------------------------------------------------------

class WrapperComponent extends Component<any, any>{

  public childComp: any;

  constructor(props: any, state: any, id: string | number | null, childComp: any) {
    super(props, state, id);
    this.childComp = childComp;
  }

  render(): RenderReturnType {
    if (this.childComp == undefined) {
      return { type: "p", props: {}, key: null } as JSX.Element;
    } else {
      return this.childComp.render(this.props, this.state);
    }
  }

}