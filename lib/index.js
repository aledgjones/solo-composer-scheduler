import { Scheduler } from "./scheduler";
import { AudioPlayer } from "./audio-player";
export * from "./types";
export const ctx = new AudioContext();
export const Transport = new Scheduler(ctx);
export const Player = new AudioPlayer(ctx);
