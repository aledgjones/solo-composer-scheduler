import { Patch, Progress, Seconds } from "./types";
import { toMidiPitchNumber } from "./utils";
import { AudioPlayer } from "./audio-player";

/**
 * A single group of samples. Each sample is assigned to a pitch.
 */
export class Sampler {
    public ctx: AudioContext;
    public volumeNode: GainNode;
    public muteNode: GainNode;
    public analyserNode: AnalyserNode;

    private player: AudioPlayer;

    constructor(ctx: AudioContext, player: AudioPlayer) {
        this.ctx = ctx;
        this.player = player;
        this.volumeNode = this.ctx.createGain();
        this.muteNode = this.ctx.createGain();
        this.analyserNode = this.ctx.createAnalyser();
        this.volumeNode.gain.value = 0.8;
        this.muteNode.gain.value = 1.0;
        this.analyserNode.fftSize = 256.0; // keep the sample sizes small to increase performance;
        this.chain(
            this.volumeNode,
            this.muteNode,
            this.analyserNode,
            this.ctx.destination
        );
    }

    /**
     * Each event has a unique id which is just a incremented number so we can cancel them.
     */
    private inc = 0;
    private events: Map<number, [GainNode, AudioBufferSourceNode]> = new Map();

    private envelope = { attack: 0, release: 0.7 };
    private samples: { [pitch: number]: AudioBuffer } = {};

    private _mute = false;
    private _solo = false;

    private chain(...nodes: AudioNode[]) {
        for (let i = 0; i < nodes.length - 1; i++) {
            const node = nodes[i];
            node.connect(nodes[i + 1]);
        }
    }

    /**
     * Returns the closest pitch to the requested pitch
     */
    private findClosestSampleToPitch(pitch: number): number {
        // shortcut if we actually have the sample pitch we need
        if (this.samples[pitch]) {
            return pitch;
        } else {
            let closest: number;
            Object.keys(this.samples).forEach((key) => {
                const lookup = parseInt(key);
                if (
                    closest === undefined ||
                    Math.abs(pitch - lookup) < Math.abs(pitch - closest)
                ) {
                    closest = lookup;
                }
            });
            return closest;
        }
    }

    /**
     * Get the RMS of the current Time Domain Data sample
     */
    private RMS() {
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
     * Load a sample with a given pitch
     */
    public async load(url: string, progress: Progress) {
        const resp = await fetch(url);
        const patch: Patch = await resp.json();
        this.envelope = { ...patch.envelope };

        let complete = 0;
        const pitches = Object.keys(patch.samples);
        pitches.forEach(async (pitch) => {
            const midiPitch = toMidiPitchNumber(pitch);
            // get the sample as a buffer and decode
            const resp = await fetch(patch.samples[pitch]);
            const data = await resp.arrayBuffer();
            const source = await this.ctx.decodeAudioData(data);

            this.samples[midiPitch] = source;
            complete++;
            progress(pitches.length, complete);
        });
    }

    /**
     * Play a pitch for a given duration at a specified time.
     */
    public play(pitch: number, when: Seconds, duration: Seconds) {
        const id = this.inc++;

        const samplePitch = this.findClosestSampleToPitch(pitch);

        const envelope = this.ctx.createGain();
        envelope.gain.value = 1.0;
        envelope.gain.setValueAtTime(1.0, when + duration);
        envelope.gain.exponentialRampToValueAtTime(
            0.01,
            when + duration + this.envelope.release
        );

        // create source and connect it to the base of the node chain
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

    /**
     * Imediately stops all scheduled and playing sounds
     */
    public stopAll() {
        this.events.forEach((value, key) => {
            this.events.delete(key);
            value.forEach((node) => {
                node.disconnect();
            });
        });
    }

    public mute() {
        this._mute = true;
        this.player.setSamplerMuteStates();
    }

    public unmute() {
        this._mute = false;
        this.player.setSamplerMuteStates();
    }

    public solo() {
        this._solo = true;
        this.player.setSamplerMuteStates();
    }

    public unsolo() {
        this._solo = false;
        this.player.setSamplerMuteStates();
    }
}
