import { EventEmitter } from "./emitter";
import { Tempo } from "./tempo";
/**
 * Schedule events along a predefined timeline of events.
 */
export class Scheduler extends EventEmitter {
    constructor(ctx) {
        super();
        /**
         * Tempo events to be scheduled
         */
        this._tempo_events = {};
        /**
         * All non-tempo events to be scheduled.
         */
        this._callback_events = {};
        /**
         * The current tick position of the scheduler.
         */
        this._tick = 0;
        this._subdivisions = 16;
        this._length = 16;
        /**
         * For each tick we calculate its length in seconds based on the tempo at the given tick.
         * This is stored here.
         */
        this._tickOffsets = [];
        this._playing = false;
        this._playStartTime = 0;
        this._scheduledTicks = {};
        this.ctx = ctx;
    }
    get tick() {
        return this._tick;
    }
    set tick(tick) {
        this._tick = tick;
        this.emit("tick", tick);
    }
    /**
     * Subdivisions are a division of the quarter beat. They are the smallest time value the
     * scheduler understands and represent one 'tick' of the scheduler.
     */
    get subdivisions() {
        return this._subdivisions;
    }
    set subdivisions(value) {
        this._subdivisions = value;
    }
    /**
     * The duration in ticks of the whole schecduler timeline. This means we can calculate the duration
     * of each tick (and therefore tempo changes) in advance.
     */
    get length() {
        return this._length;
    }
    set length(value) {
        this._length = value;
        this._parseTempoChanges();
    }
    /**
     * Whenever we create tempo changes we need to update the tick durations.
     */
    _parseTempoChanges() {
        // default to 120
        let tempo = new Tempo(0, 120);
        let currentTime = 0;
        for (let tick = 0; tick <= this.length; tick++) {
            if (this._tempo_events[tick]) {
                tempo = this._tempo_events[tick];
            }
            this._tickOffsets[tick] = currentTime;
            const currentTempo = tempo.getAt(tick);
            currentTime = currentTime + 60 / currentTempo / this.subdivisions;
        }
    }
    _schedulePlayback(tick, when) {
        const events = this._callback_events[tick];
        if (events) {
            events.forEach(([duration, callback]) => {
                // calculate how long the duration is in seconds.
                const span = this._tickOffsets[tick + duration] -
                    this._tickOffsets[tick];
                callback(when, span);
            });
        }
    }
    /**
     * Get the current tick during playback
     */
    getCurrentTick() {
        const position = this.ctx.currentTime - this._playStartTime;
        for (let tick = 0; tick <= this.length; tick++) {
            if (this._tickOffsets[tick] > position) {
                return tick < 0 ? 0 : tick - 1;
            }
        }
        return this.length;
    }
    loop() {
        const tick = this.getCurrentTick();
        if (tick !== this.tick) {
            this.tick = tick;
        }
        if (tick === this.length) {
            this.pause();
        }
        const lookaheadTime = this.ctx.currentTime - this._playStartTime + 0.2;
        for (let tick = this.tick; tick <= this._length; tick++) {
            // only look ahead to events less than 200ms away
            if (this._tickOffsets[tick] < lookaheadTime) {
                // only schedule events not already scheduled
                if (this._scheduledTicks[tick] === undefined) {
                    // scedule events
                    this._schedulePlayback(tick, this._playStartTime + this._tickOffsets[tick]);
                    // set the tick as scheduled
                    this._scheduledTicks[tick] = true;
                }
            }
            else {
                break;
            }
        }
        setTimeout(() => {
            if (this._playing) {
                this.loop.call(this);
            }
        }, 25);
    }
    /**
     * Remove all scheduled events from the scheduler. This includes tempo events and callback
     * events.
     */
    clear() {
        this._tempo_events = {};
        this._callback_events = {};
        this._tickOffsets = [];
        // after clearing all the events we need to recalculate the tick track
        this._parseTempoChanges();
    }
    /**
     * Schedule a tempo change at a given tick.
     *
     * If _from_ and _duration_ args are omitted, the tempo will take effect immediately. Else the
     * tempo will be ramped smoothly between the to and from values over the duration given
     */
    scheduleTempoChange(tick, to, from, duration) {
        this._tempo_events[tick] = new Tempo(tick, to, from, duration);
        this._parseTempoChanges();
    }
    scheduleEvent(tick, duration, callback) {
        if (!this._callback_events[tick]) {
            this._callback_events[tick] = new Set();
        }
        // store the callback and duration in ticks as tempos may be added after
        // these need to be calculated on the fly.
        this._callback_events[tick].add([duration, callback]);
    }
    seek(tick) {
        if (this._playing) {
            this.pause(true);
            this.tick = tick;
            this.start(true);
        }
        else {
            this.tick = tick;
        }
    }
    start(silent) {
        if (this.tick === this.length) {
            return;
        }
        if (!silent) {
            this.emit("start");
        }
        this._playing = true;
        // we work out when tick 0 would have been.
        this._playStartTime =
            this.ctx.currentTime - this._tickOffsets[this.tick];
        this.loop();
    }
    stop(silent) {
        this.pause(silent);
        this.tick = 0;
    }
    pause(silent) {
        if (!silent) {
            this.emit("stop");
        }
        this._playing = false;
        this._scheduledTicks = {};
    }
}
