import { EventEmitter } from "./emitter";
import { Tick, Ticks, BPM, Callback } from "./types";
/**
 * Schedule events along a predefined timeline of events.
 */
export declare class Scheduler extends EventEmitter<"start" | "stop" | "tick"> {
    constructor(ctx: AudioContext);
    /**
     * The audio context is used for precise timing of events.
     */
    ctx: AudioContext;
    /**
     * Tempo events to be scheduled
     */
    private _tempo_events;
    /**
     * All non-tempo events to be scheduled.
     */
    private _callback_events;
    /**
     * The current tick position of the scheduler.
     */
    private _tick;
    get tick(): Tick;
    set tick(tick: Tick);
    private _subdivisions;
    /**
     * Subdivisions are a division of the quarter beat. They are the smallest time value the
     * scheduler understands and represent one 'tick' of the scheduler.
     */
    get subdivisions(): number;
    set subdivisions(value: number);
    private _length;
    /**
     * The duration in ticks of the whole schecduler timeline. This means we can calculate the duration
     * of each tick (and therefore tempo changes) in advance.
     */
    get length(): number;
    set length(value: number);
    /**
     * For each tick we calculate its length in seconds based on the tempo at the given tick.
     * This is stored here.
     */
    private _tickOffsets;
    /**
     * Whenever we create tempo changes we need to update the tick durations.
     */
    private _parseTempoChanges;
    private _playing;
    private _playStartTime;
    private _scheduledTicks;
    private _schedulePlayback;
    /**
     * Get the current tick during playback
     */
    private getCurrentTick;
    private loop;
    /**
     * Remove all scheduled events from the scheduler. This includes tempo events and callback
     * events.
     */
    clear(): void;
    /**
     * Schedule a tempo change at a given tick.
     *
     * If _from_ and _duration_ args are omitted, the tempo will take effect immediately. Else the
     * tempo will be ramped smoothly between the to and from values over the duration given
     */
    scheduleTempoChange(tick: Tick, to: BPM, from?: BPM, duration?: Ticks): void;
    scheduleEvent(tick: Tick, duration: Ticks, callback: Callback): void;
    seek(tick: Tick): void;
    start(silent?: boolean): void;
    stop(silent?: boolean): void;
    pause(silent?: boolean): void;
}
