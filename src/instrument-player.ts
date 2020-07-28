import { Progress, Seconds } from "./types";
import { chain } from "./utils";
import { AudioPlayer } from "./audio-player";
import { ExpressionPlayer } from "./expression-player";

// TODO: structure it so instruments have expressions. volume, mute and analyser nodes
// at the instrument level.

/**
 * A single group of samples. Each sample is assigned to a pitch.
 */
export class InstrumentPlayer {
    public ctx: AudioContext;
    public volumeNode: GainNode;
    public muteNode: GainNode;
    public analyserNode: AnalyserNode;

    private player: AudioPlayer;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.volumeNode = this.ctx.createGain();
        this.muteNode = this.ctx.createGain();
        this.analyserNode = this.ctx.createAnalyser();
        this.volumeNode.gain.value = 0.8;
        this.muteNode.gain.value = 1.0;
        this.analyserNode.fftSize = 256.0; // keep the sample sizes small to increase performance;
        chain(
            this.volumeNode,
            this.muteNode,
            this.analyserNode,
            this.ctx.destination
        );
    }

    private expressions: { [expression: number]: ExpressionPlayer } = {};

    public mute = false;
    public solo = false;

    /**
     * Get the RMS of the current Time Domain Data sample
     */
    public RMS() {
        const data = new Float32Array(this.analyserNode.fftSize);
        this.analyserNode.getFloatTimeDomainData(data);
        const squared = data.reduce((out, value) => {
            return out + value * value;
        }, 0);
        return Math.sqrt(squared / data.length) * 2;
    }

    /**
     * The peak value in the current Time Domain Data sample
     */
    public peak() {
        const data = new Float32Array(this.analyserNode.fftSize);
        this.analyserNode.getFloatTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
            const value = data[i];
            if (value > peak) {
                peak = value;
            }
        }
        return peak;
    }

    /**
     * Load an expression patch
     */
    public async load(expression: number, url: string, progress: Progress) {
        const player = new ExpressionPlayer(this.ctx, this);
        await player.load(url, progress);
        this.expressions[expression] = player;
    }

    /**
     * Play a pitch for a given duration at a specified time.
     */
    public play(
        expression: number,
        pitch: number,
        when: Seconds,
        duration: Seconds
    ) {
        this.expressions[expression].play(pitch, when, duration);
    }

    /**
     * Imediately stops all scheduled and playing sounds
     */
    public stopAll() {
        const keys = Object.keys(this.expressions);
        keys.forEach((key) => {
            this.expressions[parseInt(key)].stopAll();
        });
    }

    /**
     * Set the volume of an instrument (0.0 - 1.0);
     */
    public volume(value: number) {
        this.volumeNode.gain.value = value * value;
    }
}
