import { Progress, Seconds } from "./types";
import { InstrumentPlayer } from "./instrument-player";
/**
 * A single group of samples. Each sample is assigned to a pitch.
 */
export declare class ExpressionPlayer {
    ctx: AudioContext;
    player: InstrumentPlayer;
    constructor(ctx: AudioContext, instrumentPlayer: InstrumentPlayer);
    /**
     * Each event has a unique id which is just a incremented number so we can cancel them.
     */
    private inc;
    private events;
    private envelope;
    /**
     * The audio buffers actually used to produce pitches.
     */
    private samples;
    /**
     * Returns the closest pitch to the requested pitch
     */
    private findClosestSampleToPitch;
    /**
     * Load a sample with a given pitch
     */
    load(url: string, progress: Progress): Promise<void>;
    /**
     * Play a pitch for a given duration at a specified time. It will find the buffer with
     * the closest pitch and tune it accordingly
     */
    play(pitch: number, when: Seconds, duration: Seconds): void;
    /**
     * Imediately stops all scheduled and playing sounds
     */
    stopAll(): void;
}
