import React, { FC, useState, useEffect, useMemo } from "react";
import { render } from "react-dom";
import { Player, Transport } from "../src";
import patch from "./natural.json";

const App: FC = () => {
    const [percent, setPercent] = useState(0);
    const [amp, setAmp] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [tick, setTick] = useState(0);

    // loader
    useEffect(() => {
        const sampler = Player.createSampler("violin");
        sampler.load(0, patch as any, (total, progress) => {
            setPercent((progress / total) * 100);
        });
        console.log(Player);
    }, []);

    // setup timeline
    useEffect(() => {
        Transport.subdivisions = 192;
        Transport.length = Transport.subdivisions * 4 * 4;
        Transport.scheduleTempoChange(0, 100);
        Transport.scheduleTempoChange(
            Transport.subdivisions * 4 * 2,
            60,
            100,
            Transport.subdivisions * 4
        );
        Transport.scheduleTempoChange(Transport.subdivisions * 4 * 3, 120);

        for (let tick = 0; tick < Transport.length; tick++) {
            if (tick % Transport.subdivisions === 0) {
                Transport.scheduleEvent(
                    tick,
                    Transport.subdivisions,
                    (when, duration) => {
                        Player.play(
                            "violin",
                            0,
                            60 + tick / Transport.subdivisions,
                            when,
                            duration
                        );
                    }
                );
            }
        }

        Transport.on("start", () => {
            setPlaying(true);
        });

        Transport.on("stop", () => {
            setPlaying(false);
            Player.stopAll();
        });

        Transport.on("tick", (tick: number) => {
            setTick(tick);
        });
    }, []);

    useEffect(() => {
        const pull = () => {
            setAmp(Player.peak("violin"));
            requestAnimationFrame(pull);
        };
        pull();
    }, []);

    if (percent === 100) {
        return (
            <>
                <div className="box">
                    <p className="box__key">Ticks</p>
                    <p>{tick}</p>
                    {playing && (
                        <div
                            className="box__bar"
                            style={{
                                transform: `scaleX(${amp})`,
                            }}
                        />
                    )}
                </div>
                <div className="buttons">
                    <button onClick={() => Transport.seek(0)}>Rewind</button>
                    <button
                        onClick={() =>
                            playing ? Transport.pause() : Transport.start()
                        }
                    >
                        {playing ? "Pause" : "Play"}
                    </button>
                    <button
                        onClick={() => {
                            setMuted((m) => !m);
                            if (muted) {
                                Player.unmute("violin");
                            } else {
                                Player.mute("violin");
                            }
                        }}
                    >
                        {muted ? "Unmute" : "Mute"}
                    </button>
                </div>
            </>
        );
    } else {
        return (
            <div className="box">
                <p>Loading {percent.toFixed(2)}%</p>
                <div
                    className="box__bar"
                    style={{ transform: `scaleX(${percent / 100})` }}
                />
            </div>
        );
    }
};

const root = document.getElementById("app");
render(<App />, root);
