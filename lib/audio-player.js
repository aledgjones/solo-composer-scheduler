import { Sampler } from "./sampler";
export class AudioPlayer {
    constructor(ctx) {
        this.samplers = {};
        this.ctx = ctx;
    }
    setSamplerMuteStates() {
        const keys = Object.keys(this.samplers);
        let found_solo = false;
        for (let i = 0; i < keys.length; i++) {
            const instrument = this.samplers[keys[i]];
            if (instrument.solo) {
                found_solo = true;
                break;
            }
        }
        keys.forEach((key) => {
            const instrument = this.samplers[key];
            if (instrument.solo) {
                instrument.muteNode.gain.value = 1;
            }
            else if (found_solo || instrument.mute) {
                instrument.muteNode.gain.value = 0;
            }
            else {
                instrument.muteNode.gain.value = 1;
            }
        });
    }
    createSampler(key) {
        const sampler = new Sampler(this.ctx, this);
        this.samplers[key] = sampler;
        this.setSamplerMuteStates();
        return sampler;
    }
}
