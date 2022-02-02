type Listener = (...args: any[]) => void;
interface Listeners {
  [event: string]: Set<Listener>;
}

/**
 * Super simple event emitter
 */
export class EventEmitter<T extends string> {
  private _events: Listeners = {};

  private _getEventListByName(eventName) {
    if (typeof this._events[eventName] === "undefined") {
      this._events[eventName] = new Set();
    }
    return this._events[eventName];
  }

  public on(event: T, fn: Listener) {
    this._getEventListByName(event).add(fn);
  }

  public emit(event: T, ...args: any[]) {
    this._getEventListByName(event).forEach((fn) => {
      fn.apply(this, args);
    });
  }

  public removeListener(event: T, fn: Listener) {
    this._getEventListByName(event).delete(fn);
  }
}
