export class Tempo {
    constructor(at, to, from, duration) {
        this.at = at;
        this.to = to;
        this.from = from;
        this.duration = duration;
        if (from === undefined) {
            this.from = to;
        }
        if (duration === undefined) {
            this.duration = 0;
        }
    }
    calculateLinearRamp(tick) {
        const x = tick - this.at;
        const grad = (this.to - this.from) / this.duration;
        const offset = this.from;
        return x * grad + offset;
    }
    getAt(tick) {
        return tick >= this.at + this.duration
            ? this.to
            : this.calculateLinearRamp(tick);
    }
}
