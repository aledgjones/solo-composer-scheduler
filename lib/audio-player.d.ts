import { InstrumentPlayer } from "./instrument-player";
export declare class AudioPlayer {
    ctx: AudioContext;
    private instruments;
    constructor(ctx: AudioContext);
    /**
     * Deal with muting and unmuting the MuteNode depending on overall state.
     *
     * Muting is dependant on solo instruments so it must take into account the whole state
     */
    setSamplerMuteStates(): void;
    RMS(instrument: string): number;
    peak(instrument: string): number;
    /**
     * Create a new sampler controled by the audio player
     */
    createSampler(key: string): InstrumentPlayer;
    /**
     * Play a note
     */
    play(instrument: string, expression: number, pitch: number, when: number, duration: number): void;
    /**
     * Imediately stop all scheduled and playing sounds
     */
    stopAll(): void;
    /**
     * Mute an instrument.
     *
     * This will take into account any solo instruments.
     */
    mute(instrument: string): void;
    /**
     * Unmute an instrument.
     *
     * This will take into account any solo instruments.
     */
    unmute(instrument: string): void;
    /**
     * Solo an instrument.
     *
     * This will take into account any muted instruments.
     */
    solo(instrument: string): void;
    /**
     * Unsolo an instrument.
     *
     * This will take into account any muted instruments.
     */
    unsolo(instrument: string): void;
    /**
     * Set the volume of an instrument (0.0 - 1.0);
     */
    volume(instrument: string, value: number): void;
}
