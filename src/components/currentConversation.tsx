import { tsxlight, Component } from '../../framework/tsxlight';
import { RenderReturnType } from '../../framework/types/types';
import { InternalEventManager } from '../../framework/managers/internalEventManager';
import { clickRecentConvoEventTag, ClickRecentConvoEvent } from '../constants/constants';

const expandStyle: React.CSSProperties = { width: "100%", height: "100vh", background: "red" };

export class CurrentConversation extends Component<any, any>{

  init() {
    this.registerForEvent(clickRecentConvoEventTag, (event: ClickRecentConvoEvent) => {
      console.log(event);
    }, this.type);
  }

  render(): RenderReturnType {
    return <div style={{ ...expandStyle }}><br /><br /><p>Test convo over here!</p></div>;
  }

}