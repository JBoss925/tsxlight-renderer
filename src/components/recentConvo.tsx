import { tsxlight, Component } from '../../framework/tsxlight';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { ClickRecentConvoEvent, clickRecentConvoEventTag } from '../constants/constants';
import { Colors } from '../constants/colorPalettes';

const containerStyle: React.CSSProperties = { width: "100%", height: "13vh" };

export type RecentConvoProps = {
  index: number,
  conversationID: string,
  otherPersonIDs: string[],
  names: string[],
  lastMessage: string,
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
    return <div style={{ ...containerStyle, paddingLeft: "1.5em", marginTop: "0.0em", marginBottom: "0.0em", background: (this.props.selected ? Colors.getScheme().backgroundRecentConvoSelected : Colors.getScheme().backgroundRecentConvo) }}>
      <a onClick={this.triggerChooseRecentConversation} style={{ width: '100%', height: '100%' }}>
        <h2 style={{ fontSize: '1.7em', color: Colors.getScheme().recentConvoNamesColor, fontFamily: 'Arial', fontWeight: 600, margin: 0, paddingBottom: '0.3em', paddingTop: '3vh' }}>{nameStr}</h2>
        <h4 style={{ fontSize: '1.1em', color: Colors.getScheme().recentConvoLastMessageTextColor, fontFamily: 'Arial', fontWeight: 400, margin: 0, marginLeft: '0em', marginTop: '0em', paddingBottom: '3vh' }}>{this.props.lastMessage}</h4>
      </a>
    </div>;
  }

}