import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType, CBPackage } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';
import { Colors } from '../constants/colorPalettes';
import { UserData } from '../internet/dataTypes';

const expandStyle: React.CSSProperties = { width: "100%", background: Colors.getScheme().backgroundCurrentConvo };

export type CurrentConversationHeaderProps = {
  users: UserData[]
}

export class CurrentConversationHeader extends Component<CurrentConversationHeaderProps, any>{

  init() {
    this.registerForEvent(clickRecentConvoEventTag, (event: ClickRecentConvoEvent) => {
      console.log(event);
    }, this.type);
    this.events.registerForOnClick(this.getUserID(), (cbPack: CBPackage) => {
      let mouseEvent = cbPack.event as MouseEvent;
      console.log(mouseEvent.offsetX, mouseEvent.offsetY);
    }, this.currentPath);
  }

  render(): RenderReturnType {
    let participantNames = this.props.users.map((user) => user.name).join(" + ");
    let participantHandles = this.props.users.map((user) => user.handle).join("  ");
    return <div style={{
      ...expandStyle,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "28px 32px 22px 32px",
      borderBottom: "1px solid " + Colors.getScheme().panelBorderColor,
      boxSizing: "border-box"
    }}>
      <div>
        <div style={{ fontSize: "0.83em", fontFamily: "Arial", color: Colors.getScheme().mutedTextColor, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "8px" }}>Active conversation</div>
        <h2 style={{ margin: 0, fontFamily: "Arial", fontSize: "2em", lineHeight: 1.05, color: Colors.getScheme().recentConvoNamesColor }}>{participantNames}</h2>
        <p style={{ margin: "10px 0 0 0", fontFamily: "Arial", fontSize: "0.98em", color: Colors.getScheme().mutedTextColor }}>{participantHandles}</p>
      </div>
      <div style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: "#fff1de",
        color: Colors.getScheme().accentGradientEnd,
        fontFamily: "Arial",
        fontWeight: 700,
        fontSize: "0.9em"
      }}>Juice flowing</div>
    </div>;
  }

}
