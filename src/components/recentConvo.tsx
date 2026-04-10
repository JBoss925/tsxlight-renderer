import { tsxlight, Component } from '../../framework/tsxlight';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { ClickRecentConvoEvent, clickRecentConvoEventTag } from '../constants/constants';
import { Colors } from '../constants/colorPalettes';

const containerStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "136px",
  marginBottom: "14px",
  borderRadius: "22px",
  boxSizing: "border-box",
  border: "1px solid " + Colors.getScheme().panelBorderColor,
  boxShadow: "0 12px 30px rgba(179, 105, 33, 0.08)"
};

export type RecentConvoProps = {
  index: number,
  conversationID: string,
  otherPersonIDs: string[],
  names: string[],
  lastMessage: string,
  snippetMeta: string,
  selected: boolean
}

export class RecentConvo extends Component<RecentConvoProps, any>{

  public triggerChooseRecentConversation() {
    this.pushEvent(clickRecentConvoEventTag, { conversationID: this.props.conversationID } as ClickRecentConvoEvent);
  }

  init() {
    if (this.props.index == 0) {
      this.initState({ selected: true });
    } else {
      this.initState({ selected: false });
    }
  }

  render(): RenderReturnType {
    let nameStr = "";
    let i = 0;
    for (let name of this.props.names) {
      if (i == 0) {
        nameStr += name;
      } else {
        nameStr += (", " + name);
      }
      i++;
    }
    return <div style={{
      ...containerStyle,
      padding: "18px 18px 16px 18px",
      background: (this.props.selected ? "linear-gradient(145deg, " + Colors.getScheme().accentGradientStart + ", " + Colors.getScheme().accentGradientEnd + ")" : Colors.getScheme().backgroundRecentConvo)
    }}>
      <a onClick={this.triggerChooseRecentConversation} style={{ width: '100%', height: '100%', display: "block", textDecoration: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{
            width: "46px",
            height: "46px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.15em",
            fontFamily: "Arial",
            fontWeight: 700,
            color: (this.props.selected ? "#fff8ef" : Colors.getScheme().accentGradientEnd),
            background: (this.props.selected ? "rgba(255,255,255,0.18)" : "#fff1de")
          }}>{nameStr[0]}</div>
          <div style={{ fontSize: "0.8em", fontFamily: "Arial", color: (this.props.selected ? "rgba(255,248,239,0.82)" : Colors.getScheme().mutedTextColor), letterSpacing: "0.06em", textTransform: "uppercase" }}>{this.props.snippetMeta}</div>
        </div>
        <h2 style={{ fontSize: '1.45em', color: (this.props.selected ? "#fffdf8" : Colors.getScheme().recentConvoNamesColor), fontFamily: 'Arial', fontWeight: 700, margin: 0, paddingBottom: '0.4em', lineHeight: 1.1 }}>{nameStr}</h2>
        <h4 style={{ fontSize: '1em', color: (this.props.selected ? "rgba(255,248,239,0.88)" : Colors.getScheme().recentConvoLastMessageTextColor), fontFamily: 'Arial', fontWeight: 400, margin: 0, lineHeight: 1.45 }}>{this.props.lastMessage}</h4>
      </a>
    </div>;
  }

}
