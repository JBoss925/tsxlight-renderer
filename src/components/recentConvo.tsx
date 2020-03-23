import { tsxlight, Component } from '../../framework/tsxlight';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { ClickRecentConvoEvent, clickRecentConvoEventTag } from '../constants/constants';

const containerStyle: React.CSSProperties = { width: "8vw", height: "15vh", background: "gray" };

export type RecentConvoProps = {
  conversationID: string,
  otherPersonIDs: string[],
  names: string[],
  lastMessage: string
}

export type RecentConvoState = {
  selected: boolean
}

export class RecentConvo extends Component<RecentConvoProps, RecentConvoState>{

  public triggerChooseRecentConversation() {
    InternalEventManager.pushEvent(clickRecentConvoEventTag, { conversationID: this.props.conversationID } as ClickRecentConvoEvent);
  }

  render(): RenderReturnType {
    let nameStr = "";
    for (let name of this.props.names) {
      nameStr += name;
    }
    return <div onClick={this.triggerChooseRecentConversation} style={{ ...containerStyle, marginLeft: "1.5em" }}>
      <h2 style={{ fontSize: '1.7em', fontWeight: 600, marginBottom: '0.3em' }}>{nameStr}</h2>
      <h4 style={{ fontSize: '1.1em', fontWeight: 400, marginLeft: '0em', marginTop: '0em' }}>{this.props.lastMessage}</h4>
    </div>;
  }

}