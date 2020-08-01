import { Patch, Progress, Seconds } from "./types";
import { toMidiPitchNumber, chain } from "./utils";
import { InstrumentPlayer } from "./instrument-player";

/**
 * A single group of samples. Each sample is assigned to a pitch.
 */
export class ExpressionPlayer {
    public ctx: AudioContext;
    public player: InstrumentPlayer;

    constructor(ctx: AudioContext, instrumentPlayer: InstrumentPlayer) {
        this.ctx = ctx;
        this.player = instrumentPlayer;
    }

    /**
     * Each event has a unique id which is just a incremented number so we can cancel them.
     */
    private inc = 0;
    private events: Map<number, [GainNode, AudioBufferSourceNode]> = new Map();

    private envelope = { attack: 0, release: 0.7 };

    /**
     * The audio buffers actually used to produce pitches.
     */
    private samples: { [pitch: number]: AudioBuffer } = {};

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
            progress(pitches.length, ++complete);
        });
    }

    /**
     * Play a pitch for a given duration at a specified time. It will find the buffer with
     * the closest pitch and tune it accordingly
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
        chain(source, envelope, this.player.volumeNode);

        source.start(when);
        source.stop(when + duration + this.envelope.release);

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
    public stopAll() {
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
    public disconnectAll() {
        this.stopAll();
        Object.keys(this.samples).forEach((key) => {
            delete this.samples[key];
        });
    }
}
