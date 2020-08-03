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
/**
 * A single group of samples. Each sample is assigned to a pitch.
 */
export class ExpressionPlayer {
    constructor(ctx, instrumentPlayer) {
        /**
         * Each event has a unique id which is just a incremented number so we can cancel them.
         */
        this.inc = 0;
        this.events = new Map();
        /**
         * The audio buffers actually used to produce pitches.
         */
        this.samples = [];
        this.ctx = ctx;
        this.player = instrumentPlayer;
    }
    /**
     * Returns the closest pitch to the requested pitch
     */
    findClosestSampleToPitch(pitch) {
        let closest;
        this.samples.forEach((sample) => {
            if (closest === undefined ||
                Math.abs(pitch - sample.pitch) < Math.abs(pitch - closest.pitch)) {
                closest = sample;
            }
        });
        return closest;
    }
    /**
     * Load a sample with a given pitch
     */
    load(url, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(url);
            const patch = yield resp.json();
            let complete = 0;
            return Promise.all(patch.map(([pitch, attack, release, data]) => __awaiter(this, void 0, void 0, function* () {
                // get the sample as a buffer and decode
                const resp = yield fetch(data);
                const buffer = yield resp.arrayBuffer();
                const source = yield this.ctx.decodeAudioData(buffer);
                this.samples.push({
                    pitch,
                    attack,
                    release,
                    source,
                });
                progress(patch.length, ++complete);
            })));
        });
    }
    /**
     * Play a pitch for a given duration at a specified time. It will find the buffer with
     * the closest pitch and tune it accordingly
     */
    play(pitch, when, duration) {
        const id = this.inc++;
        const sample = this.findClosestSampleToPitch(pitch);
        const envelope = this.ctx.createGain();
        envelope.gain.value = 1.0;
        envelope.gain.setValueAtTime(1.0, when + duration);
        envelope.gain.exponentialRampToValueAtTime(0.01, when + duration + sample.release);
        // create source and connect it to the base of the node chain
        const source = this.ctx.createBufferSource();
        source.buffer = sample.source;
        source.detune.value = (pitch - sample.pitch) * 100;
        chain(source, envelope, this.player.volumeNode);
        source.start(when);
        source.stop(when + duration + sample.release);
        this.events.set(id, [envelope, source]);
        source.onended = () => {
            this.events.delete(id);
            source.disconnect();
            envelope.disconnect();
        };
    }
    /**
     * Imediately stops all scheduled and playing sounds
     */
    stopAll() {
        this.events.forEach((value, key) => {
            this.events.delete(key);
            value.forEach((node) => {
                node.disconnect();
            });
        });
    }
    /**
     * Disconnect all the playback nodes so they can be garbage collected
     */
    disconnectAll() {
        this.stopAll();
        this.samples = [];
    }
}
