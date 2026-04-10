import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';
import { RecentConvo } from './recentConvo';
import { Colors } from '../constants/colorPalettes';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';
import { JSDOM } from 'jsdom';

const expandStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  background: Colors.getScheme().backgroundRecentConvosBar,
  boxSizing: "border-box",
  padding: "18px 22px 26px 22px"
};

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
        lastMessage: "Orange gradient concept looks good. Want the icon to feel more fresh?",
        snippetMeta: "2m ago"
      },
      {
        index: 1,
        conversationID: "convo2",
        otherPersonIDs: ["id2", "id1"],
        names: ["Phineas", "Jagger"],
        lastMessage: "Let’s keep the sidebar warm and bright so the demo reads like a product shot.",
        snippetMeta: "18m ago"
      }
    ];
    let recentConvos = [];
    for (let convoData of recentConvosData) {
      recentConvos.push(<RecentConvo conversationID={convoData.conversationID}
        index={convoData.index} otherPersonIDs={convoData.otherPersonIDs}
        names={convoData.names} lastMessage={convoData.lastMessage}
        snippetMeta={convoData.snippetMeta}
        selected={((this.state.selectedConversationID == undefined) ? (convoData.index == 0) : (this.state.selectedConversationID == convoData.conversationID))} />);
    }
    return <div style={{ ...expandStyle }}>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "2.15em", lineHeight: 1.1, fontFamily: "Arial", color: Colors.getScheme().recentConvoNamesColor }}>
          Fresh chats,
          <br />
          bright UI.
        </h1>
        <p style={{ margin: "12px 0 0 0", fontSize: "1em", lineHeight: 1.5, fontFamily: "Arial", color: Colors.getScheme().mutedTextColor }}>
          A playful proof-of-concept inbox rendered through TSXLight’s custom component tree.
        </p>
      </div>
      <div>{recentConvos}</div>
    </div>;
  }

}
