import { Component } from "../tsxlight";



export type JSXGenElType = JSX.ElementClass | JSX.Element | Component<any, any> | JSXGenElType[];
export type DOMTreeTypes = JSX.Element | Component<any, any> | JSX.Element[] | number | string | undefined | any;
export type DOMTreeTypesDef = string | number | JSX.Element | Component<any, any> | JSX.Element[] | any;
// TSX Prop Requirements START -------------------------------------------------

export type PropsType = {
  children?: any;
}

// TSX Prop Requirements END ---------------------------------------------------

declare namespace JSX {
  interface Element { }
  interface ElementClass { }
  interface IntrinsicElements { div: any; }
}