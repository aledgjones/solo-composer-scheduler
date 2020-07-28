/**
 * A number representing a tick of the schedulers timeline.
 */
export declare type Tick = number;
/**
 * A number representing a number of ticks
 */
export declare type Ticks = number;
/**
 * A number representing seconds
 */
export declare type Seconds = number;
/**
 * Beat per minute with a quarter as its beat unit.
 */
export declare type BPM = number;
/**
 * A callback to be used with the schedule function to schedule events at a specific tick on
 * the scheduler timeline. It will be called with 2 args:
 *
 * __at__: the time to fire the audio event using the highly accurate AudioContext time.
 *
 * __duration__: The duration in sconds taking into account tempo changes.
 *
 * ```
 * transport.schedule((at, duration) => {
 *      AudioBufferSourceNode.start(at, 0, duration);
 * }, 16, 16)
 * ```
 */
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
