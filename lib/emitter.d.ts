declare type Listener = (...args: any[]) => void;
export declare class EventEmitter<T extends string> {
    private _events;
    private _getEventListByName;
    on(event: T, fn: Listener): void;
    emit(event: T, ...args: any[]): void;
    removeListener(event: T, fn: Listener): void;
}
export {};
