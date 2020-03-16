import { tsxlight, Component } from '../framework/tsxlight';
import { PageManager } from '../framework/pageManager';
import { StateManager } from '../framework/stateManager';
import { inspect } from 'util';
let fs = require('fs');

type LightProps = {
  className: string,
  yeet: string
};

type LightState = {
  count: number
}

let x: any;

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
    return <div onClick={this.log}>Hello<p style={{ color: "red" }}>{this.state.count}</p></div>;
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

  public render() {
    return <LightComponent2 className="help123123" yeet="off245235">whateversdfasf!!</LightComponent2>
  }

}

class LightComponent4 extends Component<LightProps, LightState> {

  public constructor(props: LightProps, state: LightState, key?: string | number | null | undefined) {
    super(props, state, key);
  }

  public render() {
    return <p>Here's page 2!</p>
  }

}

let y = <LightComponent3 className="ye34234et" yeet="offjjjjjj2"></LightComponent3> as Component<any, any>;

tsxlight.registerPage("page1", y, (id: string, base: Component<any, any>) => { }, (id: string, base: Component<any, any>) => { });

tsxlight.registerPage("page2", <LightComponent4 className="44444" yeet="4444"></LightComponent4>, (id: string, base: Component<any, any>) => { }, (id: string, base: Component<any, any>) => { });

tsxlight.transitionToPage("page1");

setTimeout(() => {
  tsxlight.transitionToPage("page2");
}, 8000);

setTimeout(() => {
  tsxlight.transitionToPage("page1");
}, 12000);

setTimeout(() => {
  x.setState({ count: 67 });
}, 14000);

setTimeout(() => {
  tsxlight.transitionToPage("page2");
}, 16000);

setTimeout(() => {
  tsxlight.transitionToPage("page1");
}, 18000);