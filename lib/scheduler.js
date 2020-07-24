import { EventEmitter } from "./emitter";
import { Tempo } from "./tempo";
class Scheduler extends EventEmitter {
    constructor() {
        super(...arguments);
        this.ctx = new AudioContext();
        this._tempo_events = {};
        this._callback_events = {};
        this._tick = 0;
        this._subdivisions = 16;
        this._length = 32;
        this._tickOffsets = [];
        this._playing = false;
        this._playStartTime = 0;
        this._scheduledTicks = new Set();
    }
    get tick() {
        return this._tick;
    }
    set tick(tick) {
        this._tick = tick;
        this.emit("tick", tick);
    }
    get subdivisions() {
        return this._subdivisions;
    }
    set subdivisions(value) {
        this._subdivisions = value;
    }
    get length() {
        return this._length;
    }
    set length(value) {
        this._length = value;
    }
    _parseTempoChanges() {
        let tempo = new Tempo(0, 120);
        let currentTime = 0;
        for (let tick = 0; tick <= this.length; tick++) {
            if (this._tempo_events[tick]) {
                tempo = this._tempo_events[tick];
            }
            const currentTempo = tempo.getAt(tick);
            console.log(currentTempo);
            currentTime = parseFloat((currentTime + 60 / currentTempo / this.subdivisions).toFixed(4));
            this._tickOffsets[tick] = currentTime;
        }
    }
    _createTickNotifier(tick, when) {
        const node = new ConstantSourceNode(this.ctx);
        const cb = () => {
            if (this._playing) {
                this.tick = tick;
                if (tick === this._length) {
                    this.pause();
                }
            }
            node.removeEventListener("ended", cb);
        };
        node.addEventListener("ended", cb);
        node.start();
        node.stop(when);
    }
    _schedulePlayback(tick, when) {
        const events = this._callback_events[tick];
        if (events) {
            events.forEach(([duration, callback]) => {
                const span = this._tickOffsets[tick + duration] -
                    this._tickOffsets[tick];
                callback(when, when + span);
            });
        }
    }
    loop() {
        const currentTickTime = this._tickOffsets[this._tick];
        const lookaheadTime = currentTickTime + 0.1;
        for (let tick = this._tick; tick <= this._length; tick++) {
            if (this._tickOffsets[tick] < lookaheadTime) {
                if (!this._scheduledTicks.has(tick)) {
                    this._createTickNotifier(tick, this._playStartTime + this._tickOffsets[tick]);
                    this._schedulePlayback(tick, this._playStartTime + this._tickOffsets[tick]);
                    this._scheduledTicks.add(tick);
                }
            }
            else {
                break;
            }
        }
        setTimeout(() => {
            if (this._playing) {
                this.loop.apply(this);
            }
        }, 50);
    }
    clear() {
        this._tempo_events = {};
        this._callback_events = {};
        this._tickOffsets = [];
        this._parseTempoChanges();
    }
    scheduleTempoChange(tick, to, from, duration) {
        this._tempo_events[tick] = new Tempo(tick, to, from, duration);
        this._parseTempoChanges();
    }
    scheduleEvent(tick, duration, callback) {
        if (!this._callback_events[tick]) {
            this._callback_events[tick] = new Set();
        }
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
        this._playStartTime =
            this.ctx.currentTime - this._tickOffsets[this._tick];
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
        this._scheduledTicks.clear();
    }
}
export const transport = new Scheduler();
