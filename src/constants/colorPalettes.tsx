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
  recentConvoNamesColor: string
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
      iconHighlightColor: "#ffb6b9"
    }],
    ['default', {
      backgroundCurrentConvo: "#ffffff",
      backgroundMessageBar: "#eefff2",
      backgroundRecentConvo: "#ffffff",
      backgroundRecentConvoSelected: "#d6fdff",
      backgroundRecentConvosBar: "#f3f7f7",
      recentConvoLastMessageTextColor: "#000000",
      recentConvoNamesColor: "#000000",
      messageBubbleYouColors: ["#eefff2"],
      messageBubbleOtherColors: ["#deffef"],
      messageTextYouColors: ["#000000"],
      messageTextOtherColors: ["#000000"],
      sendMessageButtonColor: "#deffef",
      iconHighlightColor: "ffb6b9"
    }]
  ]);


  public static getScheme() {
    // TODO: try to get preferred color scheme, else use default
    let preferencesColorScheme = 'default';
    return this.colorSchemes.get(preferencesColorScheme) as ColorsType;

  }



}