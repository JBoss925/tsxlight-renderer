import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: "gray" };

export class RecentConversations extends Component<any, any>{

  render(): RenderReturnType {
    let recentConvos = [];
    recentConvos.push(<p>Test1</p>, <p>Test2</p>);

    return <div style={{ ...expandStyle }}>{recentConvos}</div>;
  }

}