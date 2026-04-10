export type ColorsType = {
  backgroundCurrentConvo: string,
  backgroundRecentConvo: string,
  backgroundRecentConvoSelected: string,
  backgroundRecentConvosBar: string,
  backgroundMessageBar: string,
  sendMessageButtonColor: string,
  iconHighlightColor: string,
  messageTextYouColors: string[],
  messageTextOtherColors: string[],
  messageBubbleYouColors: string[],
  messageBubbleOtherColors: string[],
  recentConvoLastMessageTextColor: string,
  recentConvoNamesColor: string,
  shellBackground: string,
  panelBorderColor: string,
  mutedTextColor: string,
  accentGradientStart: string,
  accentGradientEnd: string
}

export class Colors {

  public static colorSchemes = new Map<string, ColorsType>([
    ['pink', {
      backgroundCurrentConvo: "#fae3d9",
      backgroundMessageBar: "#fbf7f5",
      backgroundRecentConvo: "#ffb6b9",
      backgroundRecentConvoSelected: "#cc9194",
      backgroundRecentConvosBar: "#ffb6b9",
      recentConvoLastMessageTextColor: "#ffffff",
      recentConvoNamesColor: "#ffffff",
      messageBubbleYouColors: ["#bbded6"],
      messageBubbleOtherColors: ["#8ac6d1"],
      messageTextYouColors: ["#ffffff"],
      messageTextOtherColors: ["#ffffff"],
      sendMessageButtonColor: "#ffb6b9",
      iconHighlightColor: "#ffb6b9",
      shellBackground: "#fff5f2",
      panelBorderColor: "#f4c7c8",
      mutedTextColor: "#93666a",
      accentGradientStart: "#ff9aa2",
      accentGradientEnd: "#ff7b8a"
    }],
    ['default', {
      backgroundCurrentConvo: "#fff8f1",
      backgroundMessageBar: "#fff2e2",
      backgroundRecentConvo: "#fffaf5",
      backgroundRecentConvoSelected: "#ffd6ad",
      backgroundRecentConvosBar: "#fff1df",
      recentConvoLastMessageTextColor: "#7f5a33",
      recentConvoNamesColor: "#1f1308",
      messageBubbleYouColors: ["#ffedd8"],
      messageBubbleOtherColors: ["#ffffff"],
      messageTextYouColors: ["#3f240a"],
      messageTextOtherColors: ["#352012"],
      sendMessageButtonColor: "#ff9f43",
      iconHighlightColor: "#ff9f43",
      shellBackground: "#fff7ee",
      panelBorderColor: "#f3cfaa",
      mutedTextColor: "#926c48",
      accentGradientStart: "#ff9a3c",
      accentGradientEnd: "#ff6b2d"
    }]
  ]);


  public static getScheme() {
    // TODO: try to get preferred color scheme, else use default
    let preferencesColorScheme = 'default';
    return this.colorSchemes.get(preferencesColorScheme) as ColorsType;

  }



}
