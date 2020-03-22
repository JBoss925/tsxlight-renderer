import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: "red" };

export class CurrentConversation extends Component<any, any>{

  render(): RenderReturnType {
    return <div style={{ ...expandStyle }}><br /><br /><p>Test convo over here!</p></div>;
  }

}