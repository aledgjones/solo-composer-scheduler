import { Tick, BPM, Ticks } from "./types";
export declare class Tempo {
    at: Tick;
    to: BPM;
    from?: BPM;
    duration?: Ticks;
    constructor(at: Tick, to: BPM, from?: BPM, duration?: Ticks);
    private calculateLinearRamp;
    getAt(tick: Tick): number;
}
