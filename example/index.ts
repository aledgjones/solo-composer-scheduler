import { transport } from "../src/scheduler";

document.addEventListener("DOMContentLoaded", function () {
    console.log(transport);

    const $play = document.getElementById("play");
    const $rewind = document.getElementById("rewind");
    const $tick = document.getElementById("tick");

    $play.onclick = () => transport.start();
    $rewind.onclick = () => transport.seek(0);

    transport.subdivisions = 32;
    transport.length = transport.subdivisions * 4 * 4;
    transport.scheduleTempoChange(0, 120);
    transport.scheduleTempoChange(
        transport.subdivisions * 4 * 2,
        60,
        120,
        transport.subdivisions * 4
    );
    transport.scheduleTempoChange(transport.subdivisions * 4 * 3, 120);

    for (let tick = 0; tick < transport.length; tick++) {
        if (tick % transport.subdivisions === 0) {
            transport.scheduleEvent(tick, 4, (start, stop) => {
                const node = transport.ctx.createOscillator();
                node.type = "square";
                node.frequency.setValueAtTime(440, transport.ctx.currentTime); // value in hertz
                node.connect(transport.ctx.destination);
                node.start(start);
                node.stop(stop);
            });
        }
    }

    transport.on("start", () => {
        $play.innerText = "Pause";
        $play.onclick = () => transport.pause();
    });

    transport.on("stop", () => {
        $play.innerText = `Start`;
        $play.onclick = () => transport.start();
    });

    transport.on("tick", (tick: number) => {
        $tick.innerText = `${tick}`;
    });
});
