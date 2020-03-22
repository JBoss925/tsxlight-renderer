import { tsxlight, Component } from '../../framework/tsxlight';
import { RecentConversations } from './recentConversations';
import { CurrentConversation } from './currentConversation';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
const noMargins: React.CSSProperties = { margin: 0, padding: 0 };
const leftBarWidth: React.CSSProperties = { width: "25%", ...noMargins };
const rightContentWidth: React.CSSProperties = { width: "75%", ...noMargins };

export class JuiceMessengerRoot extends Component<any, any> {

  render(): RenderReturnType {
    return (
      <div style={{ ...noMargins, display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...leftBarWidth }}>
          <RecentConversations></RecentConversations>
        </div>
        <div style={{ ...rightContentWidth }}>
          <CurrentConversation></CurrentConversation>
        </div>
      </div>);
  }
}

tsxlight.registerPage("page1", <JuiceMessengerRoot></JuiceMessengerRoot>, () => { }, () => { });