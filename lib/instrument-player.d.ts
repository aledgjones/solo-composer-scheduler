import { Progress, Seconds } from "./types";
/**
 * Represents an instrument which can play multiple 'expressions'.
 */
export declare class InstrumentPlayer {
    ctx: AudioContext;
    volumeNode: GainNode;
    muteNode: GainNode;
    analyserNode: AnalyserNode;
    constructor(ctx: AudioContext);
    /**
     * The ExpressionPlayers used for actual playback and enveloping of the audio buffer.
     */
    private expressions;
    /**
     * Represents if the instrument is muted
     */
    mute: boolean;
    /**
     * Represents if the instrument is solo
     */
    solo: boolean;
    /**
     * Get the RMS of the current Time Domain Data sample
     */
    RMS(): number;
    /**
     * The peak value in the current Time Domain Data sample
     */
    peak(): number;
    /**
     * Load an expression patch
     */
    load(expression: number, url: string, progress: Progress): Promise<void>;
    /**
     * Play a pitch for a given duration at a specified time.
     */
    play(expression: number, pitch: number, when: Seconds, duration: Seconds): void;
    /**
     * Imediately stops all scheduled and playing sounds
     */
    stopAll(): void;
    /**
     * Set the volume of an instrument (0.0 - 1.0);
     */
    volume(value: number): void;
    /**
     * Disconnect all the playback nodes so they can be garbage collected
     */
    disconnectAll(): void;
}
