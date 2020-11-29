import { Progress, Seconds } from "./types";
import { chain } from "./utils";
import { ExpressionPlayer } from "./expression-player";

/**
 * Represents an instrument which can play multiple 'expressions'.
 */
export class InstrumentPlayer {
    public ctx: AudioContext;
    public volumeNode: GainNode;
    public muteNode: GainNode;
    public analyserNode: AnalyserNode;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.volumeNode = this.ctx.createGain();
        this.muteNode = this.ctx.createGain();
        this.analyserNode = this.ctx.createAnalyser();
        this.volumeNode.gain.value = 0.8;
        this.muteNode.gain.value = 1.0;
        this.analyserNode.fftSize = 256.0; // keep the sample sizes small to increase performance;
        chain(this.volumeNode, this.muteNode, this.analyserNode, this.ctx.destination);
    }

    /**
     * The ExpressionPlayers used for actual playback and enveloping of the audio buffer.
     */
    private expressions: { [expression: number]: ExpressionPlayer } = {};

    /**
     * Represents if the instrument is muted
     */
    public mute = false;

    /**
     * Represents if the instrument is solo
     */
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
    public play(expression: number, pitch: number, when: Seconds, duration: Seconds) {
        // FIXME: Make this a little more sophisticated with fallbacks
        if (this.expressions[expression]) {
            this.expressions[expression].play(pitch, when, duration);
        } else {
            // play using standard Expression.Natural
            this.expressions[0].play(pitch, when, duration);
        }
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

    /**
     * Disconnect all the playback nodes so they can be garbage collected
     */
    public disconnectAll() {
        this.volumeNode.disconnect();
        this.muteNode.disconnect();
        this.analyserNode.disconnect();
        Object.keys(this.expressions).forEach((key) => {
            this.expressions[key].disconnectAll();
            delete this.expressions[key];
        });
    }
}
