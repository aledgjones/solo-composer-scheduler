var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toMidiPitchNumber } from "./utils";
export class Sampler {
    constructor(ctx, player) {
        this.inc = 0;
        this.events = new Map();
        this.envelope = { attack: 0, release: 0.7 };
        this.samples = {};
        this._mute = false;
        this._solo = false;
        this.ctx = ctx;
        this.player = player;
        this.volumeNode = this.ctx.createGain();
        this.muteNode = this.ctx.createGain();
        this.analyserNode = this.ctx.createAnalyser();
        this.volumeNode.gain.value = 0.8;
        this.muteNode.gain.value = 1.0;
        this.analyserNode.fftSize = 256.0;
        this.chain(this.volumeNode, this.muteNode, this.analyserNode, this.ctx.destination);
    }
    chain(...nodes) {
        for (let i = 0; i < nodes.length - 1; i++) {
            const node = nodes[i];
            node.connect(nodes[i + 1]);
        }
    }
    findClosestSampleToPitch(pitch) {
        if (this.samples[pitch]) {
            return pitch;
        }
        else {
            let closest;
            Object.keys(this.samples).forEach((key) => {
                const lookup = parseInt(key);
                if (closest === undefined ||
                    Math.abs(pitch - lookup) < Math.abs(pitch - closest)) {
                    closest = lookup;
                }
            });
            return closest;
        }
    }
    RMS() {
        const data = new Float32Array(this.analyserNode.fftSize);
        this.analyserNode.getFloatTimeDomainData(data);
        const squared = data.reduce((out, value) => {
            return out + value * value;
        }, 0);
        return Math.sqrt(squared / data.length) * 2;
    }
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
    load(url, progress) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield fetch(url);
            const patch = yield resp.json();
            this.envelope = Object.assign({}, patch.envelope);
            let complete = 0;
            const pitches = Object.keys(patch.samples);
            pitches.forEach((pitch) => __awaiter(this, void 0, void 0, function* () {
                const midiPitch = toMidiPitchNumber(pitch);
                const resp = yield fetch(patch.samples[pitch]);
                const data = yield resp.arrayBuffer();
                const source = yield this.ctx.decodeAudioData(data);
                this.samples[midiPitch] = source;
                complete++;
                progress(pitches.length, complete);
            }));
        });
    }
    play(pitch, when, duration) {
        const id = this.inc++;
        const samplePitch = this.findClosestSampleToPitch(pitch);
        const envelope = this.ctx.createGain();
        envelope.gain.value = 1.0;
        envelope.gain.setValueAtTime(1.0, when + duration);
        envelope.gain.exponentialRampToValueAtTime(0.01, when + duration + this.envelope.release);
        const source = this.ctx.createBufferSource();
        source.buffer = this.samples[samplePitch];
        source.detune.value = (pitch - samplePitch) * 100;
        this.chain(source, envelope, this.volumeNode);
        source.start(when);
        source.stop(when + duration + this.envelope.release);
        source.onended = () => {
            this.events.delete(id);
            source.disconnect();
            envelope.disconnect();
        };
    }
    stopAll() {
        this.events.forEach((value, key) => {
            this.events.delete(key);
            value.forEach((node) => {
                node.disconnect();
            });
        });
    }
    mute() {
        this._mute = true;
        this.player.setSamplerMuteStates();
    }
    unmute() {
        this._mute = false;
        this.player.setSamplerMuteStates();
    }
    solo() {
        this._solo = true;
        this.player.setSamplerMuteStates();
    }
    unsolo() {
        this._solo = false;
        this.player.setSamplerMuteStates();
    }
}
