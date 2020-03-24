import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';
import { RecentConvo } from './recentConvo';
import { Colors } from '../constants/colorPalettes';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';
import { JSDOM } from 'jsdom';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: Colors.getScheme().backgroundRecentConvosBar };

export type RecentConversationsState = {
  selectedConversationID: string | undefined
}

export class RecentConversations extends Component<any, RecentConversationsState>{

  init() {
    this.initState({
      selectedConversationID: undefined
    });
    this.registerForEvent(clickRecentConvoEventTag, (ev: ClickRecentConvoEvent) => {
      this.setState({ selectedConversationID: ev.conversationID });
    });
  }

  render(): RenderReturnType {
    let recentConvosData = [
      {
        index: 0,
        conversationID: "convo1",
        otherPersonIDs: ["id1", "id2"],
        names: ["Jagger", "Phineas"],
        lastMessage: "Here is the last message"
      },
      {
        index: 1,
        conversationID: "convo2",
        otherPersonIDs: ["id2", "id1"],
        names: ["Phineas", "Jagger"],
        lastMessage: "Here is the last message from the other"
      }
    ];
    let recentConvos = [];
    for (let convoData of recentConvosData) {
      recentConvos.push(<RecentConvo conversationID={convoData.conversationID}
        index={convoData.index} otherPersonIDs={convoData.otherPersonIDs}
        names={convoData.names} lastMessage={convoData.lastMessage}
        selected={((this.state.selectedConversationID == undefined) ? (convoData.index == 0) : (this.state.selectedConversationID == convoData.conversationID))} />);
    }
    return <div style={{ ...expandStyle }}>{recentConvos}</div>;
  }

}