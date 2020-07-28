import { Tick, BPM, Ticks } from "./types";
/**
 * The Tompo Class represents a change of tempo. Either imediately or over a duration.
 */
export declare class Tempo {
    at: Tick;
    to: BPM;
    from?: BPM;
    duration?: Ticks;
    constructor(at: Tick, to: BPM, from?: BPM, duration?: Ticks);
    private calculateLinearRamp;
    /**
     * Calculate the tempo at a given tick taking into account tempo ramping between values.
     */
    getAt(tick: Tick): number;
}
