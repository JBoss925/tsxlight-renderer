export class InternalEventManager {

  public static eventCallbacks = new Map<string, Map<string, Set<((event: any) => any)>>>();

  public static pushEvent(tag: string, event: any) {
    let x = this.eventCallbacks.get(tag);
    if (x == undefined) {
      return;
    }
    for (let set of x.values()) {
      for (let f of set.values()) {
        f(event);
      }
    }
  }

  public static registerForEvent(tag: string, callback: ((event: any) => any), id?: string) {
    let idVal = id ? id : "defaultID";
    if (this.eventCallbacks.has(tag)) {
      let calls = this.eventCallbacks.get(tag) as Map<string, Set<((event: any) => any)>>;
      let z = calls.get(idVal);
      if (z == undefined) {
        let newSet = new Set<(event: any) => any>();
        newSet.add(callback);
        calls.set(idVal, newSet);
      } else {
        calls.delete(idVal);
        z.add(callback);
      }
      this.eventCallbacks.set(tag, calls);
    } else {
      let newSet = new Set<(event: any) => any>();
      newSet.add(callback);
      let newMap = new Map<string, Set<(event: any) => any>>();
      newMap.set(idVal, newSet);
      this.eventCallbacks.set(tag, newMap);
    }
  }

}