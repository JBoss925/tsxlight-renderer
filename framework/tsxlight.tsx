import { inspect } from 'util';
import { v4 as uuidv4 } from 'uuid';

// Start file end!
const fs = require('fs');

// TSX HTML Window Setup START -------------------------------------------------

import { BrowserWindow } from 'electron';
const { app } = require('electron');

(() => {
  let s = fs.readFileSync('template/templateInit.html');
  fs.writeFileSync('template/template.html', s);
})();

export let window: BrowserWindow;
let windowShowRes: Function;
function createWindow() {
  // Create the browser window.     
  window = new BrowserWindow({ width: 800, height: 600 })
  // and load the index.html of the app.
  refreshWindow();
  windowShowRes("ready");
}
export let showWindow = () => { windowShown = windowShown.then(() => window.show()); };
export let hideWindow = () => { windowShown = windowShown.then(() => window.hide()) };
export let refreshWindow = () => { windowShown = windowShown.then(() => window.loadFile('template/template.html')); };
(() => { app.on('ready', createWindow); })();
let windowShown: Promise<any> = new Promise<any>((res, rej) => {
  windowShowRes = res;
});

// TSX HTML Window Setup END ---------------------------------------------------

// TSX Prop Requirements START -------------------------------------------------

export type PropsType = {
  children?: (DOMTreeTypes) | (JSXGenElType | JSXGenElType[])[];
}

// TSX Prop Requirements END ---------------------------------------------------

// TSX Renderer START ----------------------------------------------------------

import { JSDOM } from 'jsdom';
import { PageManager, PageCallback } from './pageManager';
import { StateManager } from './stateManager';

type renderable = Component<any, any> | JSX.Element;

export class tsxlightinstance {
  constructor() { };
  public pageMan: PageManager = new PageManager(this);
  public stateMan: StateManager = new StateManager(this);
  public initString = fs.readFileSync('template/templateInit.html');
  public currentDom: JSDOM = new JSDOM(this.initString);
  public currentRoot: HTMLElement | null = null;
  public baseApp: BaseAppComponent | undefined;
  public getAllSubcomponents(baseComponent: Component<any, any> | JSX.Element): Component<any, any>[] {
    let subComps: Component<any, any>[] = [];
    if (baseComponent instanceof Component) {
      let rChildren = baseComponent.props.children;
      for (let i = 0; i < rChildren.length; i++) {
        let rChild = rChildren[i];
        if (rChild instanceof Component) {
          subComps.push(rChild);
        }
        if (typeof (rChild) == "string" || typeof (rChild) == "number" || typeof (rChild) == "undefined") {
        } else {
          subComps.push(...this.getAllSubcomponents((rChild as (Component<any, any> | JSX.Element))));
        }
      }
    } else {
      // It's an element, get its prop children
      let children = baseComponent.props.children;
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child instanceof Component) {
          subComps.push(child);
        }
        if (typeof (child) == "string" || typeof (child) == "number" || typeof (child) == "undefined") {
        } else {
          subComps.push(...this.getAllSubcomponents((child as (Component<any, any> | JSX.Element))));
        }
      }
    }
    return subComps;
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
  public transitionToPage(pageID: string) {
    if (this.baseApp != undefined) {
      this.saveAllStates(this.baseApp?.userApp as Component<any, any>);
    }
    this.pageMan.transitionToPage(pageID);
  }
  public saveAllStates(base: Component<any, any>) {
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So call init!
        child.saveState();
        this.saveAllStates(child);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.saveAllStates(child);
      }
    }
  }
  public clearAllChildren(base: Component<any, any>) {
    base.renderedChildren = [];
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So call init!
        this.clearAllChildren(child);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.clearAllChildren(child);
      }
    }
    base.props.children = [];
  }
  public clearRenderedChildren(base: Component<any, any>) {
    base.renderedChildren = [];
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So call init!
        this.clearRenderedChildren(child);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.clearRenderedChildren(child);
      }
    }
  }
  public preRender() {
    let currentComp = PageManager.getCurrentBaseComponent();
    if (!(currentComp instanceof Component)) {
      throw new Error("Attempted to render with normal JSX.Element as root! It must be a component!")
    }
    if (this.baseApp == undefined) {
      this.baseApp = new BaseAppComponent(currentComp, {}, {});
    } else {
      this.baseApp.setChild(currentComp);
    }
    // console.log("ENTER RENDER");
    // console.log(PageManager.getCurrentBaseComponent());
    // console.log(currentComp?.props?.children[0]?.props?.children[0]?.props?.children[0]);
    // console.log(currentComp?.props?.children[0]?.props?.children[0]?.props?.children[0]);
    // console.log(this.baseApp.userApp);
    // this.baseApp.renderApp();
    // this.baseApp.renderChildren();
    // this.renderPaths(this.baseApp);
  }
  public doRender() {
    this.clearRenderedChildren(this.baseApp as Component<any, any>);
    // this.pageMan.loadStates(this.baseApp as Component<any, any>);
    // this.renderPaths(this.baseApp as Component<any, any>);
    this.renderToElectron(this.baseApp as Component<any, any>);
  }
  public renderToElectron(comp: Component<any, any>) {
    fs.writeFileSync('template/template.html', this.renderComponentToDOMString([comp]));
    // console.log(baseComponent);
    refreshWindow();
  }
  public render() {
    this.preRender();
    this.doRender();
    fs.writeFileSync('out/help131231232.json', JSON.stringify(this.baseApp?.userApp));
    // console.log("ID HERE!");
    // console.log(currentComp?.props?.children[0]?.props?.children[0]?.props?.children[0]);
    // showWindow();
  }
  private renderPaths(base: Component<any, any> | JSX.Element, currPath?: string) {
    if (currPath == undefined) {
      currPath = '/' + PageManager.currentPageID + '/';
      currPath += base.type;
      (base as BaseAppComponent).currentPath = currPath;
    }
    if (base instanceof Component && !(base instanceof BaseAppComponent)) {
      currPath += '/';
      currPath += base.type;
      base.currentPath = currPath;
    }
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
      } else if (child instanceof Component) {
        // We're a component! So call init!
        this.renderPaths(child, currPath);
      } else {
        // We're an element, recurse!
        // Do nothing!
        this.renderPaths(child, currPath);
      }
    }
  }
  public rerender = () => {
    if (PageManager.getCurrentBaseComponent() == undefined) {
      throw new Error("Current component is undefined! Cannot rerender!");
    }
    // this.render();
    this.renderToElectron(this.baseApp as Component<any, any>);
    fs.writeFileSync('out/helpme.json', JSON.stringify(this.baseApp, ["renderedChildren", "props", "children"]));
  };
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
  public compOrJSXToHTMLElm(renderableIn: (string | number | JSX.Element | JSX.ElementClass | Component<any, any> | JSXGenElType[] | JSXGenElType[] | Component<any, any> | JSX.Element[])[]): string | number | undefined {
    if (renderableIn.length <= 0) {
      return "Error! No renderables provided to tsxlight!";
    }
    let renderedStr = "";
    for (let i = 0; i < renderableIn.length; i++) {
      if (renderableIn[i] == undefined || typeof (renderableIn[i]) == "string" || typeof (renderableIn[i]) == "number") {
        // It's a value!
        renderedStr += renderableIn[i] as string | number | undefined;
      }
      if (renderableIn[i] instanceof Component) {
        // If it's a component, return the recursed value of children
        let renderComp = renderableIn[i] as Component<any, any>;
        if (renderComp.renderedChildren.length <= 0) {
          renderedStr += "";
        } else {
          renderedStr += this.compOrJSXToHTMLElm(renderComp.renderedChildren);
        }
      } else {
        // It's an element!
        let element = renderableIn[i] as JSX.Element;
        if (typeof (element) != "string" && typeof (element) != "number") {
          if (element.props.id == undefined) {
            element.key = uuidv4();
          } else {
            element.key = element.props.id;
          }
        }
        console.log(element.key);
        let elementType: string = element.type;
        let propsString = "";
        if (elementType != undefined) {
          let elmProps = element.props;
          if (elmProps != undefined) {
            let keyVals: [string, string | number][] = [];
            for (let [key, value] of Object.entries(elmProps)) {
              if (key == "children") {
                continue;
              } else {
                if (typeof (value) == "string") {
                  keyVals.push([key, ('\"' + value + '\"')]);
                }
                if (typeof (value) == "number") {
                  keyVals.push([key, ('\"' + value + '\"')]);
                }
              }
            }
            for (let [key, value] of keyVals) {
              propsString += " ";
              propsString += key;
              propsString += "=";
              propsString += value;
            }
          }
          let elmChildren: (JSX.Element)[] = (element as any).props?.children;
          let elmChildrenStr = "";
          if (elmChildren != undefined && elmChildren.length > 0) {
            elmChildrenStr += this.compOrJSXToHTMLElm(elmChildren) as string;
          }
          renderedStr += `<${elementType}${propsString}>${elmChildrenStr}</${elementType}>`;
        }
      }
    }
    return renderedStr;
  }
  public renderComponentToDOMString(baseComponents: Component<any, any>[]): string {
    this.currentRoot = this.currentDom.window.document.getElementById("tsxlight-app");
    if (this.currentRoot == null) {
      return "Couldn't find base root of app in template!";
    }
    this.currentRoot.innerHTML = this.compOrJSXToHTMLElm(baseComponents) as string;
    return `<${this.currentRoot.tagName} id="tsxlight-app">${this.currentRoot.innerHTML}</${this.currentRoot.tagName}>`;
  }
}

export let tsxlight = new tsxlightinstance();

// TSX Renderer END ------------------------------------------------------------

// Component base START --------------------------------------------------------

type JSXGenElType = JSX.ElementClass | JSX.Element | Component<any, any> | JSXGenElType[];
type DOMTreeTypes = JSX.Element | Component<any, any> | JSX.Element[] | number | string | undefined;
type DOMTreeTypesDef = string | number | JSX.Element | Component<any, any> | JSX.Element[];

export abstract class Component<P, S> implements JSX.ElementClass {
  public type: any = this.constructor.name;
  public currentPath: string = "NO CURRENT PATH SET";
  public props: P & PropsType;
  public state: any;
  public renderedChildren: ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = [];
  public key: string | number | null | undefined;
  abstract render(): (JSXGenElType | JSXGenElType[]);
  public renderChildren: (currPath?: string) => ((DOMTreeTypesDef) | JSXGenElType | JSXGenElType[])[] = (currPath?: string) => {
    if (currPath == undefined) {
      let z = Array.from(PageManager.idToBaseComponent.values()).filter(x => x.type == this.type);
      currPath = '/' + PageManager.currentPageID + '/[' + (z.length - 1) + ']' + this.type;
      this.currentPath = currPath;
    }
    // this.currentPath = currPath;
    this.renderedChildren = [];
    this.props.children = [];
    // console.log(this);
    let rendVal = this.render();
    // console.log("rendval!!!!!");
    let x = (rendVal as any).props.children;
    if (x != undefined) {
      // console.log(inspect(x[0]));
    }
    if (Array.isArray(rendVal)) {
      this.props.children = rendVal;
    } else {
      this.props.children = [rendVal];
    }
    let childrenCopy = this.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (typeof (child) == "string" || typeof (child) == "number") {
        // Do nothing!
        this.renderedChildren.push(child);
      } else if (child instanceof Component) {
        // We're a component! So render children!
        (child as Component<any, any>).currentPath = currPath + '/[' + i + ']' + (child as Component<any, any>).type;
        (child as Component<any, any>).init();
        this.renderedChildren.push(...(child as Component<any, any>).renderChildren((child as Component<any, any>).currentPath));
      } else {
        // Render and recurse
        (child as any)['renderedChildren'] = [];
        let childrenCopy = (child as any).props.children ? (child as any).props.children : [];
        let renderElChil = ((thisArg: any) => {
          if (typeof (thisArg) == "string" || typeof (thisArg) == "number" || typeof (thisArg) == "undefined") {
            if (typeof (thisArg) == "undefined") {
              throw new Error("Undefined element child!");
            }
            return [thisArg];
          }
          for (let n = 0; n < (thisArg as any).props.children.length; n++) {
            let x = (thisArg as any).props.children[n];
            if (x instanceof Component) {
              x['renderedChildren'] = [];
              (x as Component<any, any>).currentPath = currPath + '/[' + n + ']' + (x as Component<any, any>).type;
              (x as Component<any, any>).init();
              (x as any)['renderedChildren'].push(...x.renderChildren(currPath));
              (thisArg as any)['renderedChildren'].push(x);
            } else if (typeof (x) != "string" && typeof (x) != "number" && typeof (x) != "undefined") {
              x['renderedChildren'] = [];
              (x as any)['renderedChildren'].push(...renderElChil(x));
              (thisArg as any)['renderedChildren'].push(x);
            } else {
              thisArg['renderedChildren'] = [];
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
    return this.renderedChildren;
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
  public init() { console.log(this.currentPath) };
  public afterRender() { };
  initState<K extends never>(state: any, callback?: (() => void) | undefined): void {
    // console.log(this.isInitialized);
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
      console.log(this);
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
      console.log(this);
      throw new Error("Path not set before setting state!");
    }
    if (StateManager.compToState.has(this.currentPath)) {
      this.state = StateManager.getCompState(this.currentPath);
    }
    callback ? callback() : (() => { })();
  }
  setState<K extends never>(state: any, callback?: (() => void) | undefined): void {
    this.state = state;
    this.saveState();
    tsxlight.rerender();
    callback ? callback() : (() => { })();
  }
  forceUpdate(callback?: (() => void) | undefined): void {
    tsxlight.rerender();
    callback ? callback() : (() => { })();
  }
  public refs: { [key: string]: any; } = {};
}

// Component base END ----------------------------------------------------------

// BaseAppComonent START -------------------------------------------------------
class BaseAppComponent extends Component<any, any>{

  public userApp: Component<any, any>;

  public constructor(userBaseComp: Component<any, any>, props: any, state: any, key?: string | number | null) {
    super(props, state, key);
    this.props.children = [];
    this.props.children = [userBaseComp];
    this.userApp = userBaseComp;
  }

  init() { };

  public hasRenderedApp = false;

  public render() {
    if (!this.hasRenderedApp) {
      return { type: "baseApp", props: { children: [] } } as JSX.Element;
    } else {
      return this.renderApp();
    }
  }

  public renderApp() {
    this.userApp.renderChildren();
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

// BaseAppComonent END --------==-----------------------------------------------