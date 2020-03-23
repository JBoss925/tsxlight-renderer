import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';
import { RecentConvo } from './recentConvo';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: "gray" };

export class RecentConversations extends Component<any, any>{

  render(): RenderReturnType {
    let recentConvos = [];
    recentConvos.push(<RecentConvo index={0} conversationID="convo1" otherPersonIDs={["id1", "id2"]} names={["Jagger", "Phineas"]} lastMessage="Here is the last message" />,
      <RecentConvo index={1} conversationID="convo2" otherPersonIDs={["id2", "id1"]} names={["Phineas", "Jagger"]} lastMessage="Here is the last message from the other" />);

    return <div style={{ ...expandStyle }}>{recentConvos}</div>;
  }

}