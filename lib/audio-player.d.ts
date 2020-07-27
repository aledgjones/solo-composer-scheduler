import { Sampler } from "./sampler";
export declare class AudioPlayer {
    ctx: AudioContext;
    private samplers;
    constructor(ctx: AudioContext);
    setSamplerMuteStates(): void;
    createSampler(key: string): Sampler;
}
