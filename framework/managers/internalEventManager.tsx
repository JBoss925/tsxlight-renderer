export class InternalEventManager {

  public static eventCallbacks = new Map<string, Map<string, ((event: any) => any)>>();

  public static pushEvent(userID: string, tag: string, event: any) {
    let x = this.eventCallbacks.get(tag + userID);
    if (x == undefined) {
      return;
    }
    for (let f of x.values()) {
      f(event);
    }
  }

  public static registerForEvent(userID: string, tag: string, callback: ((event: any) => any), id?: string) {
    let idVal = id ? id : "defaultID";
    let tagVal = tag + userID;
    if (this.eventCallbacks.has(tagVal)) {
      let calls = this.eventCallbacks.get(tagVal) as Map<string, ((event: any) => any)>;
      calls.set(idVal, callback);
      this.eventCallbacks.set(tagVal, calls);
    } else {
      let newMap = new Map<string, (event: any) => any>();
      newMap.set(idVal, callback);
      this.eventCallbacks.set(tagVal, newMap);
    }
  }

}