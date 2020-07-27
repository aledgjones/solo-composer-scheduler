import { Progress, Seconds } from "./types";
import { AudioPlayer } from "./audio-player";
export declare class Sampler {
    ctx: AudioContext;
    volumeNode: GainNode;
    muteNode: GainNode;
    analyserNode: AnalyserNode;
    private player;
    constructor(ctx: AudioContext, player: AudioPlayer);
    private inc;
    private events;
    private envelope;
    private samples;
    private _mute;
    private _solo;
    private chain;
    private findClosestSampleToPitch;
    private RMS;
    peak(): number;
    load(url: string, progress: Progress): Promise<void>;
    play(pitch: number, when: Seconds, duration: Seconds): void;
    stopAll(): void;
    mute(): void;
    unmute(): void;
    solo(): void;
    unsolo(): void;
}
