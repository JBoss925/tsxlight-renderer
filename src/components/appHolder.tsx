import { tsxlight, Component } from '../../framework/tsxlight';
import { RecentConversations } from './recentConversations';
import { CurrentConversation } from './currentConversation';
import { JSXGenElType, RenderReturnType } from '../../framework/types/types';
import { Colors } from '../constants/colorPalettes';

const noMargins: React.CSSProperties = { margin: 0, padding: 0 };
const shellStyle: React.CSSProperties = {
  ...noMargins,
  minHeight: "100vh",
  background: Colors.getScheme().shellBackground,
  padding: "24px",
  boxSizing: "border-box"
};
const frameStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  minHeight: "calc(100vh - 48px)",
  borderRadius: "28px",
  overflow: "hidden",
  border: "1px solid " + Colors.getScheme().panelBorderColor,
  boxShadow: "0 24px 80px rgba(171, 92, 21, 0.14)"
};
const leftBarWidth: React.CSSProperties = { width: "29%", ...noMargins };
const rightContentWidth: React.CSSProperties = { width: "71%", ...noMargins };

const brandBadgeStyle: React.CSSProperties = {
  width: "58px",
  height: "58px",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg, " + Colors.getScheme().accentGradientStart + ", " + Colors.getScheme().accentGradientEnd + ")",
  boxShadow: "0 16px 34px rgba(255, 123, 41, 0.2)"
};

const iconLeafStyle: React.CSSProperties = {
  position: "absolute",
  top: "8px",
  right: "9px",
  width: "13px",
  height: "8px",
  borderRadius: "12px 12px 0 12px",
  background: "#3ea556",
  transform: "rotate(-22deg)"
};

function JuiceFruitIcon() {
  return (
    <div style={{ position: "relative", width: "34px", height: "34px" }}>
      <div style={{
        position: "absolute",
        inset: "4px 3px 1px 3px",
        borderRadius: "50% 50% 46% 46%",
        background: "radial-gradient(circle at 30% 28%, #ffd58e 0%, #ffb84d 22%, #ff8a24 55%, #ef6316 100%)",
        border: "2px solid rgba(255,255,255,0.32)"
      }} />
      <div style={{
        position: "absolute",
        left: "16px",
        top: "3px",
        width: "3px",
        height: "7px",
        borderRadius: "999px",
        background: "#7a4317",
        transform: "rotate(12deg)"
      }} />
      <div style={{ ...iconLeafStyle }} />
      <div style={{
        position: "absolute",
        left: "10px",
        top: "13px",
        width: "14px",
        height: "14px",
        borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.25)"
      }} />
    </div>
  );
}

export class JuiceMessengerRoot extends Component<any, any> {

  render(): RenderReturnType {
    return (
      <div style={{ ...shellStyle }}>
        <div style={{ ...frameStyle }}>
          <div style={{ ...leftBarWidth }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "22px 22px 0 22px",
              boxSizing: "border-box",
              background: Colors.getScheme().backgroundRecentConvosBar
            }}>
              <div style={{ ...brandBadgeStyle }}>
                <JuiceFruitIcon />
              </div>
              <div>
                <div style={{ fontSize: "0.82em", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: "Arial", color: Colors.getScheme().mutedTextColor, marginBottom: "5px" }}>
                  Juice
                </div>
                <div style={{ fontSize: "1.35em", lineHeight: 1.05, fontWeight: 700, fontFamily: "Arial", color: Colors.getScheme().recentConvoNamesColor }}>
                  Messenger
                </div>
              </div>
            </div>
            <RecentConversations></RecentConversations>
          </div>
          <div style={{ ...rightContentWidth }}>
            <CurrentConversation></CurrentConversation>
          </div>
        </div>
      </div>);
  }
}

tsxlight.registerPage("page1", <JuiceMessengerRoot></JuiceMessengerRoot>, () => { }, () => { });
