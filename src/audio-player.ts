import { Sampler } from "./sampler";

export class AudioPlayer {
    public ctx: AudioContext;
    private samplers: { [key: string]: Sampler } = {};

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
    }

    /**
     * Deal with muting and unmuting the MuteNode depending on overall state.
     *
     * Muting is dependant on solo instruments so it must take into account the whole state
     */
    public setSamplerMuteStates() {
        const keys = Object.keys(this.samplers);

        // solo trumps mute so we need to find if we have solos
        let found_solo = false;
        for (let i = 0; i < keys.length; i++) {
            const instrument = this.samplers[keys[i]];
            if (instrument.solo) {
                found_solo = true;
                break;
            }
        }

        // set the correct state
        keys.forEach((key) => {
            const instrument = this.samplers[key];
            if (instrument.solo) {
                instrument.muteNode.gain.value = 1;
            } else if (found_solo || instrument.mute) {
                instrument.muteNode.gain.value = 0;
            } else {
                instrument.muteNode.gain.value = 1;
            }
        });
    }

    /**
     * Create a new sampler controled by the audio player
     */
    public createSampler(key: string): Sampler {
        const sampler = new Sampler(this.ctx, this);
        this.samplers[key] = sampler;
        this.setSamplerMuteStates();
        return sampler;
    }
}
