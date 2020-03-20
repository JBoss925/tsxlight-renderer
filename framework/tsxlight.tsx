import { inspect } from 'util';
import { v4 as uuidv4 } from 'uuid';

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

let electronApp: Electron.App | undefined = undefined;

if (TSXSettings.getRenderMode() == RenderMode.EXPRESS) {
  TSXSettings.loadSettings();
} else if (TSXSettings.getRenderMode() == RenderMode.ELECTRON) {
  const { app } = require('electron');
  electronApp = app;
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
import { DOMTreeTypesDef, JSXGenElType, DOMTreeTypes, PropsType } from './types/types';

export let window: BrowserWindow;
let windowShowRes: Function;
function createWindow() {
  TSXSettings.loadSettings();
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

if (TSXSettings.getRenderMode() == RenderMode.ELECTRON) {
  (() => { (electronApp as Electron.App).on('ready', createWindow); })();
}

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
  public createElement(tagType: any, props: any, ...value: string[] | number[] | undefined[] | null[]): JSX.Element {
    let propsWithChildren = { ...props, children: value };
    if (typeof (tagType) == "string") {
      let element = { type: tagType, props: propsWithChildren, key: propsWithChildren.id ? propsWithChildren.id : null } as JSX.Element;
      return element;
    } else {
      let element = new tagType(propsWithChildren, {} as any, propsWithChildren.id ? propsWithChildren.id : null) as JSX.Element;
      return element;
    }
  }
}

export let tsxlight = new TsxlightRenderManager();

// TSX Renderer END ------------------------------------------------------------

// Component base START --------------------------------------------------------

export abstract class Component<P, S> implements JSX.ElementClass {
  public type: any = this.constructor.name;
  public currentPath: string = "NO CURRENT PATH SET";
  public props: P & PropsType;
  public state: any;
  public renderedChildren: ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = [];
  public key: string | number | null | undefined;
  abstract render(): (JSXGenElType | JSXGenElType[]);
  private getUserIDFromCurrentPath(): string {
    return this.currentPath.split("/")[1];
  }
  public transitionToPage(pageID: string) {
    tsxlight.transitionToPage(pageID, this.getUserIDFromCurrentPath());
  }
  public renderChildren: (currPath?: string, tsx?: tsxlightinstance) => ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = (currPath?: string, tsx?: tsxlightinstance) => {
    if (currPath == undefined) {
      let z = Array.from(PageManager.pageIdToBaseComponent.values()).filter(x => x.type == this.type);
      currPath = '/' + UserManager.getUserIDForRendererID(tsx?.instanceID as number) + '/' + PageManager.getCurrentPageIDForTsxID(tsx?.instanceID as number) + '/[' + (z.length - 1) + ']' + this.type;
      this.currentPath = currPath;
    } else {
      this.props.children = [];
    }
    this.renderedChildren = [];
    let rendVal = this.render();

    if (!(rendVal instanceof Component) && (rendVal as any).type == undefined && (rendVal as any).props == undefined) {
      // Do nothing!
      // We're an any type!
      this.renderedChildren.push(rendVal);
      return this.renderedChildren;
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
        for (let n = 0; n < (thisArg as any).props.children.length; n++) {
          let x = (thisArg as any).props.children[n];
          if (x instanceof Component) {
            x['renderedChildren'] = [];
            (x as Component<any, any>).currentPath = currPath + '/[' + n + ']' + (x as Component<any, any>).type;
            (x as Component<any, any>).init();
            (thisArg as any)['renderedChildren'].push(...x.renderChildren(currPath));
          } else if (typeof (x) != "string" && typeof (x) != "number" && typeof (x) != "undefined") {
            x['renderedChildren'] = [];
            renderElChil(x);
            // (x as any)['renderedChildren'].push(...renderElChil(x));
            (thisArg as any)['renderedChildren'].push(x);
          } else {
            (thisArg as any)['renderedChildren'].push(x);
          }
        }
        return (thisArg as any)['renderedChildren'] as JSX.Element[];
      });
      renderElChil(rendVal);
      this.renderedChildren.push(rendVal);
      return this.renderedChildren;
    }
    let x = (rendVal as any).props.children;
    if (Array.isArray(rendVal)) {
      this.props.children = rendVal;
    } else {
      this.props.children = [rendVal];
    }
    let childrenCopy = this.props.children;
    if (!Array.isArray(childrenCopy)) {
      this.doRecurseInst(childrenCopy, currPath, 0);
      return this.renderedChildren;
    }
    for (let i = 0; i < childrenCopy.length; i++) {
      this.doRecurseInst(childrenCopy[i] as any, currPath, i);
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
    tsxlight.rerender(this.getUserIDFromCurrentPath());
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
    this.userApp.renderChildren(undefined, this.tsxlightInstance);
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