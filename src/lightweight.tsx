import { TSXSettings, RenderMode } from "../framework/managers/settingsManager";

import { tsxlight, Component } from '../framework/tsxlight';
import { PageManager } from '../framework/managers/pageManager';
import { StateManager } from '../framework/managers/stateManager';
import { inspect } from 'util';
let fs = require('fs');

type LightProps = {
  className: string,
  yeet: string
};

type LightState = {
  count: number
}

let x: LightComponent;

let z = 10;

// setTimeout(() => {
//   z = 1240;
//   x.forceUpdate();
// }, 17000);

class LightComponent extends Component<LightProps, LightState>{

  public constructor(props: LightProps, state: LightState, key?: string | number | null | undefined) {
    super(props, state, key);
    x = this;
  }

  public init() {
    console.log("Init the state here with initState()!");
    this.initState({ count: 9 });
  }

  public afterRender() {
    console.log("After render hook!");
  }

  public log() {
    console.log("Log callback!")
  }

  public render() {
    return <div onClick={this.log}>Hello<p style={{ paddingLeft: "20em", color: "red" }}>{this.state.count + z}</p></div>;
  }

}

class LightComponent2 extends Component<LightProps, LightState> {

  public constructor(props: LightProps, state: LightState, key?: string | number | null | undefined) {
    super(props, state, key);
  }

  public render() {
    return <div id="someotherthing"><LightComponent className="help" yeet="off">some type of text!!</LightComponent></div>
  }

}

class LightComponent3 extends Component<LightProps, LightState> {

  public constructor(props: LightProps, state: LightState, key?: string | number | null | undefined) {
    super(props, state, key);
  }

  public toPageTwo() {
    this.transitionToPage("page2");
  }

  public render() {
    return <div id="pushItTotheLimit"><p style={{ fontSize: "24pt" }} onClick={this.toPageTwo}>Here to page 2!</p><LightComponent2 className="help123123" yeet="off245235">whateversdfasf!!</LightComponent2></div>
  }

}

class LightComponent4 extends Component<LightProps, LightState> {
  public constructor(props: LightProps, state: LightState, key?: string | number | null | undefined) {
    super(props, state, key);
  }

  public toPageOne() {
    this.transitionToPage("page1");
  }

  public render() {
    return <div><p>Here's page 2!</p><br /><p onClick={this.toPageOne}>CLICK HERE to go to page 1!</p></div>
  }

}

let y = <LightComponent3 className="ye34234et" yeet="offjjjjjj2"></LightComponent3> as Component<any, any>;

tsxlight.registerPage("page1", y, (id: string, base: Component<any, any>) => { }, (id: string, base: Component<any, any>) => { });

tsxlight.registerPage("page2", <LightComponent4 className="44444" yeet="4444"></LightComponent4>, (id: string, base: Component<any, any>) => { }, (id: string, base: Component<any, any>) => { });

// if (TSXSettings.getSettings().mode == RenderMode.ELECTRON) {
//   tsxlight.transitionToPage("page1");

//   setTimeout(() => {
//     tsxlight.transitionToPage("page2");
//   }, 4000);

//   setTimeout(() => {
//     tsxlight.transitionToPage("page1");
//   }, 8000);

//   setTimeout(() => {
//     x.setState({ count: 67 });
//   }, 10000);

//   setTimeout(() => {
//     tsxlight.transitionToPage("page2");
//   }, 12000);

//   setTimeout(() => {
//     tsxlight.transitionToPage("page1");
//   }, 14000);
// }


// setTimeout(() => {
//   x.transitionToPage("page2");
// }, 18000);