var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { chain } from "./utils";
import { ExpressionPlayer } from "./expression-player";
/**
 * Represents an instrument which can play multiple 'expressions'.
 */
export class InstrumentPlayer {
    constructor(ctx) {
        /**
         * The ExpressionPlayers used for actual playback and enveloping of the audio buffer.
         */
        this.expressions = {};
        /**
         * Represents if the instrument is muted
         */
        this.mute = false;
        /**
         * Represents if the instrument is solo
         */
        this.solo = false;
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
     * Get the RMS of the current Time Domain Data sample
     */
    RMS() {
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
    peak() {
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
    load(expression, url, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const player = new ExpressionPlayer(this.ctx, this);
            yield player.load(url, progress);
            this.expressions[expression] = player;
        });
    }
    /**
     * Play a pitch for a given duration at a specified time.
     */
    play(expression, pitch, when, duration) {
        this.expressions[expression].play(pitch, when, duration);
    }
    /**
     * Imediately stops all scheduled and playing sounds
     */
    stopAll() {
        const keys = Object.keys(this.expressions);
        keys.forEach((key) => {
            this.expressions[parseInt(key)].stopAll();
        });
    }
    /**
     * Set the volume of an instrument (0.0 - 1.0);
     */
    volume(value) {
        this.volumeNode.gain.value = value * value;
    }
    /**
     * Disconnect all the playback nodes so they can be garbage collected
     */
    disconnectAll() {
        this.volumeNode.disconnect();
        this.muteNode.disconnect();
        this.analyserNode.disconnect();
        Object.keys(this.expressions).forEach((key) => {
            this.expressions[key].disconnectAll();
            delete this.expressions[key];
        });
    }
}
