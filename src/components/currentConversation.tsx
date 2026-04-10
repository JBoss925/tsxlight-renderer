import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType, CBPackage } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';
import { Colors } from '../constants/colorPalettes';
import { CurrentConversationHeader } from './conversationHeader';
import { UserData } from '../internet/dataTypes';

const expandStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  background: Colors.getScheme().backgroundCurrentConvo,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column"
};

type DemoMessage = {
  author: string,
  text: string,
  fromYou: boolean
}

type DemoConversation = {
  users: UserData[],
  eyebrow: string,
  messages: DemoMessage[]
}

export class CurrentConversation extends Component<any, { selectedConversationID: string | undefined }>{

  init() {
    this.initState({
      selectedConversationID: "convo1"
    });
    this.registerForEvent(clickRecentConvoEventTag, (cbPack: CBPackage) => {
      this.setState({
        selectedConversationID: (cbPack as any).conversationID
      });
    }, this.type);
  }

  render(): RenderReturnType {
    let conversations = new Map<string, DemoConversation>([
      ["convo1", {
        users: [{ name: "Jagger", handle: "@jagger" }, { name: "Phineas", handle: "@phineas" }],
        eyebrow: "Brand polish pass",
        messages: [
          { author: "Phineas", text: "The renderer is finally feeling stable in-browser. We should make the demo look screenshot-ready.", fromYou: false },
          { author: "Jagger", text: "Agreed. I want warmer colors, a clearer header, and something iconic that sells the Juice name immediately.", fromYou: true },
          { author: "Phineas", text: "What if the mark is a stylized orange instead of a generic chat bubble?", fromYou: false },
          { author: "Jagger", text: "Perfect. Bright citrus gradients, rounded cards, and a friendlier thread layout should do it.", fromYou: true }
        ]
      }],
      ["convo2", {
        users: [{ name: "Phineas", handle: "@phineas" }, { name: "Jagger", handle: "@jagger" }],
        eyebrow: "Launch notes",
        messages: [
          { author: "Phineas", text: "We should mention that the whole UI is coming from a custom TSX renderer, not React DOM.", fromYou: false },
          { author: "Jagger", text: "Yep. That is the interesting part under the surface, even if the demo itself stays lightweight.", fromYou: true },
          { author: "Phineas", text: "The inbox just needs enough personality to make that underlying experiment feel intentional.", fromYou: false }
        ]
      }]
    ]);

    let currentConversation = conversations.get(this.state.selectedConversationID || "convo1") as DemoConversation;
    let messageNodes = currentConversation.messages.map((message, index) => {
      return <div key={index} style={{
        display: "flex",
        justifyContent: (message.fromYou ? "flex-end" : "flex-start"),
        marginBottom: "14px"
      }}>
        <div style={{
          maxWidth: "62%",
          padding: "14px 16px",
          borderRadius: (message.fromYou ? "20px 20px 8px 20px" : "20px 20px 20px 8px"),
          background: (message.fromYou ? Colors.getScheme().messageBubbleYouColors[0] : Colors.getScheme().messageBubbleOtherColors[0]),
          color: (message.fromYou ? Colors.getScheme().messageTextYouColors[0] : Colors.getScheme().messageTextOtherColors[0]),
          border: "1px solid " + Colors.getScheme().panelBorderColor,
          boxShadow: "0 10px 24px rgba(145, 81, 27, 0.06)"
        }}>
          <div style={{ fontFamily: "Arial", fontSize: "0.78em", textTransform: "uppercase", letterSpacing: "0.12em", color: Colors.getScheme().mutedTextColor, marginBottom: "8px" }}>{message.author}</div>
          <div style={{ fontFamily: "Arial", fontSize: "1.02em", lineHeight: 1.55 }}>{message.text}</div>
        </div>
      </div>;
    });

    return (<div style={{ ...expandStyle }}>
      <CurrentConversationHeader users={currentConversation.users} />
      <div style={{ padding: "28px 32px", boxSizing: "border-box", flex: 1 }}>
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontFamily: "Arial", fontSize: "0.83em", textTransform: "uppercase", letterSpacing: "0.22em", color: Colors.getScheme().mutedTextColor, marginBottom: "10px" }}>{currentConversation.eyebrow}</div>
          <p style={{ margin: 0, fontFamily: "Arial", fontSize: "1.05em", lineHeight: 1.6, color: Colors.getScheme().recentConvoLastMessageTextColor, maxWidth: "740px" }}>
            Juice Messenger is a lightweight messaging mockup used to show off TSXLight’s per-user rendering model, event callbacks, and live rerender flow.
          </p>
        </div>
        <div>
          {messageNodes}
        </div>
      </div>
    </div>);
  }

}
