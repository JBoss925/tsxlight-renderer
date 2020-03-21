import { Component } from "../tsxlight";



export type JSXGenElType = JSX.ElementClass | JSX.Element | Component<any, any> | JSXGenElType[];
export type DOMTreeTypes = JSX.Element | Component<any, any> | JSX.Element[] | number | string | undefined | any;
export type DOMTreeTypesDef = string | number | JSX.Element | Component<any, any> | JSX.Element[] | any;
// TSX Prop Requirements START -------------------------------------------------

export type ChildType = (JSXGenElType | JSX.Element | JSX.ElementClass | string | number | Function | undefined);

export type PropsType = {
  children?: ChildType | ChildType[];
}

// TSX Prop Requirements END ---------------------------------------------------