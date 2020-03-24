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
    return <div style={{ ...expandStyle }}>Here is the convo header</div>;
  }

}