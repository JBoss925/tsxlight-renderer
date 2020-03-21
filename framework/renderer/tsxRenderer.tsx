// TSX Renderer START ----------------------------------------------------------

import { JSDOM } from 'jsdom';
import { PageManager, PageCallback } from '../managers/pageManager';
import { StateManager } from '../managers/stateManager';
import { UserManager } from '../managers/userManager';
import { InternalEventManager } from '../managers/internalEventManager';
import { refreshWindow, Component, BaseAppComponent } from '../tsxlight';
import { TSXSettings, RenderMode } from '../managers/settingsManager';
import { JSXGenElType } from '../types/types';
import { CallbackManager } from '../managers/callbackManager';
import { ServerManager } from '../managers/serverManager';
import { userIDToSocket, socketFromUserID } from '../server/serverHandler';
let fs = require('fs');

type renderable = Component<any, any> | JSX.Element;

export class tsxlightinstance {
  constructor(id: number) {
    this.instanceID = id;
    PageManager.setTsxForTsxID(this.instanceID, this);
  };
  private getHTMLFilePath() {
    return 'template/users/template_' + UserManager.getUserIDForRendererID(this.instanceID) + ".html"
  }
  private writeTemplateToHTMLFile() {
    fs.writeFileSync(this.getHTMLFilePath(), this.initString);
  }
  public initString = TSXSettings.getRenderMode() == RenderMode.ELECTRON ? fs.readFileSync('template/templateTempElectron.html').toString() as string : fs.readFileSync('template/templateInitExpress.html').toString() as string;
  public currentDom: JSDOM = new JSDOM(this.initString);
  public currentRoot: HTMLElement | null = null;
  public baseApp: BaseAppComponent | undefined;
  public instanceID: number;
  public getAllSubcomponents(baseComponent: Component<any, any> | JSX.Element): Component<any, any>[] {
    let subComps: Component<any, any>[] = [];
    if (baseComponent instanceof Component) {
      let rChildren = baseComponent.props.children;
      for (let i = 0; i < rChildren.length; i++) {
        let rChild = rChildren[i];
        if (rChild instanceof Component) {
          subComps.push(rChild);
        }
        if (!(rChild instanceof Component) && (rChild as any).type == undefined && (rChild as any).props == undefined) {

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
        if (!(child instanceof Component) && (child as any).type == undefined && (child as any).props == undefined) {
        } else {
          subComps.push(...this.getAllSubcomponents((child as (Component<any, any> | JSX.Element))));
        }
      }
    }
    return subComps;
  }
  public transitionToPage(pageID: string) {
    if (this.baseApp != undefined) {
      this.saveAllStates(this.baseApp?.userApp as Component<any, any>);
    }
    PageManager.transitionToPage(this.instanceID, pageID);
  }
  public saveAllStates(base: Component<any, any>) {
    let childrenCopy = base.props.children;
    for (let i = 0; i < childrenCopy.length; i++) {
      let child = childrenCopy[i];
      // If it's a value
      if (!(child instanceof Component) && (child as any).type == undefined && (child as any).props == undefined) {
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
      if (!(child instanceof Component) && (child as any).type == undefined && (child as any).props == undefined) {
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
      if (!(child instanceof Component) && (child as any).type == undefined && (child as any).props == undefined) {
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
    if (!fs.existsSync(this.getHTMLFilePath())) {
      this.writeTemplateToHTMLFile();
    }

    let currentComp = PageManager.getCurrentBaseComponent(this.instanceID);
    if (!(currentComp instanceof Component)) {
      throw new Error("Attempted to render with normal JSX.Element as root! It must be a component!")
    }
    if (this.baseApp == undefined) {
      this.baseApp = new BaseAppComponent(currentComp, this, {}, {});
    } else {
      this.baseApp.setChild(currentComp);
    }
  }
  public doRender() {
    this.clearRenderedChildren(this.baseApp as Component<any, any>);
    this.baseApp?.renderApp();
    this.renderToElectron(this.baseApp?.userApp as Component<any, any>);
  }
  public renderToElectron(comp: Component<any, any>) {
    if ((TSXSettings.settings as any)['processPort'] == undefined) {
      (TSXSettings.settings as any)['processPort'] = ServerManager.port;
      TSXSettings.settingsStr = JSON.stringify(TSXSettings.settings);
    }
    let domStr = "\n<meta id=\"tsxlight-settings\" name=\"tsxlight-settings\" content=\"" + TSXSettings.settingsStr + "\"></meta>" + this.renderComponentToDOMString([comp]) + "\n";
    try {
      let userID = UserManager.getUserIDForRendererID(this.instanceID);
      let conn = socketFromUserID(userID);
      conn.send(domStr);
    } catch (err) {
      console.log("Electron user not connected yet!");
    }
    // refreshWindow();
  }
  public render() {
    this.preRender();
    this.doRender();
  }
  public rerender = () => {
    if (PageManager.getCurrentBaseComponent(this.instanceID) == undefined) {
      throw new Error("Current component is undefined! Cannot rerender!");
    }
    this.render();
  };
  otherIDInd = 0;
  otherIDPref = "tsxlight-"
  public compOrJSXToString(renderableIn: (string | number | JSX.Element | JSX.ElementClass | Component<any, any> | JSXGenElType[] | JSXGenElType[] | Component<any, any> | JSX.Element[])[], depth?: number, lastComp?: Component<any, any> | undefined): string | number | undefined {
    if (renderableIn.length <= 0) {
      return "Error! No renderables provided to tsxlight!";
    }
    if (depth == undefined) {
      depth = 1;
    }
    let tabStr = "";
    for (let i = 0; i < depth; i++) {
      tabStr += "\t";
    }
    let renderedStr = "";
    for (let i = 0; i < renderableIn.length; i++) {
      if (!(renderableIn[i] instanceof Component) && (renderableIn[i] as any).type == undefined && (renderableIn[i] as any).props == undefined) {
        // It's a value!
        renderedStr += ("\n" + tabStr + (renderableIn[i] as string | number | undefined));
      }
      if (renderableIn[i] instanceof Component) {
        // If it's a component, return the recursed value of children
        let renderComp = renderableIn[i] as Component<any, any>;
        if (renderComp.renderedChildren.length <= 0) {
          renderedStr += "";
        } else {
          renderedStr += this.compOrJSXToString(renderComp.renderedChildren, depth, renderableIn[i] as Component<any, any>);
        }
      } else {
        // It's an element!
        let element = renderableIn[i] as JSX.Element;
        if (!(element instanceof Component) && (element as any).type != undefined && (element as any).props != undefined) {
          if (element.props.id == undefined) {
            element.key = (this.otherIDPref + this.otherIDInd);
            this.otherIDInd++;
          } else {
            element.key = element.props.id;
          }
        }
        let elementType: string = element.type;
        let propsString = "";
        if (elementType != undefined) {
          let elmProps = element.props;
          if (elmProps != undefined) {
            let keyVals: [string, string | number][] = [];
            let objEntries = Object.entries(elmProps);
            for (let [key, value] of objEntries) {
              if (key.startsWith("on")) {
                // We're a callback!
                let f = value as Function;
                let userIDStr = UserManager.getUserIDForRendererID(this.instanceID);
                let n = ('\"callbackMessenger(event, \'' + element.key + '\', \'' + key + '\')\"');
                let cbID = "/" + element.key + "/" + key;
                CallbackManager.addCallback(userIDStr, PageManager.getCurrentPageIDForTsxID(this.instanceID), cbID, f, lastComp);
                keyVals.push([key.toLowerCase(), n]);
                continue;
              } else if (key == "children") {
                continue;
              } else if (key == "id") {
                keyVals.push([key, value as string | number]);
              } else if (key == "style") {
                let styleString = "\""
                let styleObj = value as React.CSSProperties;
                for (let [styleKey, styleVal] of Object.entries(styleObj)) {
                  // Now we need to convert the style key
                  let positions = [];
                  for (let b = 0; b < styleKey.length; b++) {
                    let x = styleKey.charAt(b);
                    if (/[A-Z]/g.test(x)) {
                      positions.push(b);
                    }
                  }
                  for (let pos of positions) {
                    // Get up to the pos
                    let split1 = styleKey.substr(0, pos);
                    let split2 = styleKey.substr(pos + 1, styleKey.length - pos - 1);
                    styleKey = split1 + styleKey[pos].toLowerCase() + split2;
                  }
                  // Got positions of capital letters, store and split.
                  let prevAdded = 0;
                  for (let pos of positions) {
                    styleKey = styleKey.substr(0, pos + prevAdded) + "-" + styleKey.substr(pos + prevAdded, styleKey.length - (pos + prevAdded))
                    prevAdded++;
                  }
                  styleString += styleKey;
                  styleString += ": ";
                  styleString += styleVal;
                  styleString += ";";
                  if (prevAdded < objEntries.length - 1) {
                    styleString += " ";
                  }
                }
                styleString += "\"";
                keyVals.push([key, styleString]);
              } else {
                if (typeof (value) == "string") {
                  keyVals.push([key, ('\"' + value + '\"')]);
                }
                if (typeof (value) == "number") {
                  keyVals.push([key, ('\"' + value + '\"')]);
                }
              }
            }
            if (element.props.id == undefined) {
              keyVals.push(["id", element.key as string | number]);
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
            elmChildrenStr += this.compOrJSXToString(elmChildren, depth + 1, lastComp) as string;
          }
          renderedStr += ("\n" + tabStr + `<${elementType}${propsString}>${elmChildrenStr}` + "\n" + tabStr + `</${elementType}>`);
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
    this.otherIDInd = 0;
    this.currentRoot.innerHTML = this.compOrJSXToString(baseComponents, 3) as string;
    return `\n\t<${this.currentRoot.tagName.toLowerCase()} id="tsxlight-app">${this.currentRoot.innerHTML}\n\t</${this.currentRoot.tagName.toLowerCase()}>`;
  }
}