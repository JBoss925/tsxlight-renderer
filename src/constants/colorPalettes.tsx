export type ColorsType = {
  backgroundCurrentConvo: string,
  backgroundRecentConvo: string,
  backgroundRecentConvoSelected: string,
  backgroundMessageBar: string,
  sendMessageButtonColor: string,
  iconHighlightColor: string,
  messageTextYouColors: string[],
  messageTextOtherColors: string[],
  messageBubbleYouColors: string[],
  messageBubbleOtherColors: string[],
  recentConvoLastMessageTextColor: string,
  recentConvoNamesColor: string
}

export class Colors {

  public static colorSchemes = new Map<string, ColorsType>([
    ['default', {
      backgroundCurrentConvo: "#fae3d9",
      backgroundMessageBar: "#fbf7f5",
      backgroundRecentConvo: "#ffb6b9",
      backgroundRecentConvoSelected: "#cc9194",
      recentConvoLastMessageTextColor: "#ffffff",
      recentConvoNamesColor: "#ffffff",
      messageBubbleYouColors: ["bbded6"],
      messageBubbleOtherColors: ["8ac6d1"],
      messageTextYouColors: ["#ffffff"],
      messageTextOtherColors: ["#ffffff"],
      sendMessageButtonColor: "ffb6b9",
      iconHighlightColor: "ffb6b9"
    }]
  ]);


  public static getScheme() {
    // TODO: try to get preferred color scheme, else use default
    let preferencesColorScheme = 'default';
    return this.colorSchemes.get(preferencesColorScheme) as ColorsType;

  }



}