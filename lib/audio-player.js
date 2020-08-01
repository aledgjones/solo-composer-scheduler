import { InstrumentPlayer } from "./instrument-player";
export class AudioPlayer {
    constructor(ctx) {
        this.instruments = {};
        this.ctx = ctx;
    }
    /**
     * Deal with muting and unmuting the MuteNode depending on overall state.
     *
     * Muting is dependant on solo instruments so it must take into account the whole state
     */
    setSamplerMuteStates() {
        const keys = Object.keys(this.instruments);
        // solo trumps mute so we need to find if we have solos
        let found_solo = false;
        for (let i = 0; i < keys.length; i++) {
            const instrument = this.instruments[keys[i]];
            if (instrument.solo) {
                found_solo = true;
                break;
            }
        }
        // set the correct state
        keys.forEach((key) => {
            const instrument = this.instruments[key];
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
    RMS(instrument) {
        return this.instruments[instrument].RMS();
    }
    peak(instrument) {
        return this.instruments[instrument].peak();
    }
    /**
     * Create a new sampler controled by the audio player
     */
    createSampler(key) {
        const sampler = new InstrumentPlayer(this.ctx);
        this.instruments[key] = sampler;
        this.setSamplerMuteStates();
        return sampler;
    }
    /**
     * Play a note
     */
    play(instrument, expression, pitch, when, duration) {
        this.instruments[instrument].play(expression, pitch, when, duration);
    }
    /**
     * Imediately stop all scheduled and playing sounds
     */
    stopAll() {
        const keys = Object.keys(this.instruments);
        keys.forEach((key) => {
            this.instruments[key].stopAll();
        });
    }
    /**
     * Mute an instrument.
     *
     * This will take into account any solo instruments.
     */
    mute(instrument) {
        this.instruments[instrument].mute = true;
        this.setSamplerMuteStates();
    }
    /**
     * Unmute an instrument.
     *
     * This will take into account any solo instruments.
     */
    unmute(instrument) {
        this.instruments[instrument].mute = false;
        this.setSamplerMuteStates();
    }
    /**
     * Solo an instrument.
     *
     * This will take into account any muted instruments.
     */
    solo(instrument) {
        this.instruments[instrument].solo = true;
        this.setSamplerMuteStates();
    }
    /**
     * Unsolo an instrument.
     *
     * This will take into account any muted instruments.
     */
    unsolo(instrument) {
        this.instruments[instrument].solo = false;
        this.setSamplerMuteStates();
    }
    /**
     * Set the volume of an instrument (0.0 - 1.0);
     */
    volume(instrument, value) {
        this.instruments[instrument].volume(value);
    }
    /**
     * Disconnect all the playback nodes so they can be garbage collected
     */
    disconnect(key) {
        this.instruments[key].disconnectAll();
        delete this.instruments[key];
    }
}
