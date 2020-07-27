export declare type Tick = number;
export declare type Ticks = number;
export declare type Seconds = number;
export declare type BPM = number;
export declare type Callback = (when: Seconds, duration: Seconds) => void;
export declare type Progress = (total: number, complete: number) => void;
export interface Patch {
    envelope: {
        attack: number;
        release: number;
    };
    samples: {
        [pitch: number]: string;
    };
}
