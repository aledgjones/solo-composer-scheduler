/**
 * Super simple event emitter
 */
export class EventEmitter {
    constructor() {
        this._events = {};
    }
    _getEventListByName(eventName) {
        if (typeof this._events[eventName] === "undefined") {
            this._events[eventName] = new Set();
        }
        return this._events[eventName];
    }
    on(event, fn) {
        this._getEventListByName(event).add(fn);
    }
    emit(event, ...args) {
        this._getEventListByName(event).forEach((fn) => {
            fn.apply(this, args);
        });
    }
    removeListener(event, fn) {
        this._getEventListByName(event).delete(fn);
    }
}
