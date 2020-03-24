import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType, CBPackage } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';
import { Colors } from '../constants/colorPalettes';
import { CurrentConversationHeader } from './conversationHeader';
import { UserData } from '../internet/dataTypes';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: Colors.getScheme().backgroundCurrentConvo };

export class CurrentConversation extends Component<any, any>{

  init() {
    this.registerForEvent(clickRecentConvoEventTag, (cbPack: CBPackage) => {
      // console.log(event);
    }, this.type);
  }

  render(): RenderReturnType {
    let userData = [{ name: "Phineas", handle: "@Phineas" }, { name: "Jagger", handle: "@Jagger" }];

    return (<div style={{ ...expandStyle }}>
      <CurrentConversationHeader users={userData} />
      <p>Test convo over here!</p>

    </div>);
  }

}