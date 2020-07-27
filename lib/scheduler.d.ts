import { EventEmitter } from "./emitter";
import { Tick, Ticks, BPM, Callback } from "./types";
export declare class Scheduler extends EventEmitter<"start" | "stop" | "tick"> {
    constructor(ctx: AudioContext);
    ctx: AudioContext;
    private _tempo_events;
    private _callback_events;
    private _tick;
    get tick(): Tick;
    set tick(tick: Tick);
    private _subdivisions;
    get subdivisions(): number;
    set subdivisions(value: number);
    private _length;
    get length(): number;
    set length(value: number);
    private _tickOffsets;
    private _parseTempoChanges;
    private _playing;
    private _playStartTime;
    private _scheduledTicks;
    private _schedulePlayback;
    private getCurrentTick;
    private loop;
    clear(): void;
    scheduleTempoChange(tick: Tick, to: BPM, from?: BPM, duration?: Ticks): void;
    scheduleEvent(tick: Tick, duration: Ticks, callback: Callback): void;
    seek(tick: Tick): void;
    start(silent?: boolean): void;
    stop(silent?: boolean): void;
    pause(silent?: boolean): void;
}
