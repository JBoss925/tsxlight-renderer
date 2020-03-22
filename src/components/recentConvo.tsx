import { tsxlight, Component } from '../../framework/tsxlight';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { ClickRecentConvoEvent, clickRecentConvoEventTag } from '../constants/constants';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: "gray" };

export type RecentConvoProps = {
  conversationID: string,
  otherPersonIDs: string[],
  names: string[],
  lastMessage: string
}

export type RecentConvoState = {
  selected: boolean
}

export class RecentConvo extends Component<any, any>{

  public triggerChooseRecentConversation() {
    InternalEventManager.pushEvent(clickRecentConvoEventTag, { conversationID: this.props.conversationID } as ClickRecentConvoEvent);
  }

  render(): RenderReturnType {
    return <div onClick={this.triggerChooseRecentConversation} style={{ ...expandStyle, marginLeft: "1.5em" }}>
      <h2 style={{ fontSize: '1.7em', fontWeight: 600, marginBottom: '0.3em' }}>{this.props.name}</h2>
      <h4 style={{ fontSize: '1.1em', fontWeight: 400, marginLeft: '0em', marginTop: '0em' }}>{this.props.lastMessage}</h4>
    </div>;
  }

}