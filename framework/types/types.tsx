import { Component } from "../tsxlight";

export type JSXGenElType = JSX.ElementClass | JSX.Element | Component<any, any> | JSXGenElType[];
export type DOMTreeTypes = JSX.Element | Component<any, any> | JSX.Element[] | number | string | undefined | any;
export type DOMTreeTypesDef = string | number | JSX.Element | Component<any, any> | JSX.Element[] | any;
// TSX Prop Requirements START -------------------------------------------------

export type ChildType = (JSXGenElType | JSX.Element | JSX.ElementClass | string | number | Function | undefined);

export type PropsType = {
  children?: ChildType | ChildType[];
}

export type RenderReturnType = JSX.ElementClass | JSX.Element | Component<any, any> | (JSX.ElementClass | JSX.Element | Component<any, any>);

// TSX Prop Requirements END ---------------------------------------------------

export type MouseEvent = {
  isTrusted: boolean,
  screenX: number,
  screenY: number,
  clientX: number,
  clientY: number,
  ctrlKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  metaKey: boolean,
  button: number,
  buttons: number,
  relatedTarget: any,
  pageX: number,
  pageY: number,
  movementX: number,
  movementY: number,
  layerX: number,
  layerY: number,
  detail: number,
  sourceCapabilities: { firesTouchEvents: boolean },
  which: number,
  type: string,
  currentTarget: { id: string },
  eventPhase: number,
  bubbles: boolean,
  cancelable: boolean,
  defaultPrevented: boolean,
  composed: boolean,
  timeStamp: number,
  returnValue: boolean,
  cancelBubble: boolean,
  target: { id: string },
  x: number,
  y: number,
  offsetX: number,
  offsetY: number
}

export type CBPackage = {
  targetID: string,
  eventType: string
  event: any
};