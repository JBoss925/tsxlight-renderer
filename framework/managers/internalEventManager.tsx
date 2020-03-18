export class InternalEventManager {

  public static eventCallbacks = new Map<string, ((event: any) => any)[]>();

  public static pushEvent(tag: string, event: any) {
    let x = this.eventCallbacks.get(tag);
    if (x == undefined) {
      return;
    }
    for (let f of x) {
      f(event);
    }
  }

  public static registerForEvent(tag: string, callback: ((event: any) => any)) {
    if (this.eventCallbacks.has(tag)) {
      let calls = this.eventCallbacks.get(tag) as ((event: any) => any)[];
      calls.push(callback);
      this.eventCallbacks.set(tag, calls);
    } else {
      this.eventCallbacks.set(tag, [callback]);
    }
  }

}