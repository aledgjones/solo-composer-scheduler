const REGEX = /^([a-gA-G])(#{1,}|b{1,}|x{1,}|)(-?\d*)\s*(.*)\s*$/;
const SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const C0 = 12;

function getMidiPitchParts(pitch: string): [string, string, number] {
    const [, letter, acc, octave] = REGEX.exec(pitch) || [];
    return [letter, acc, +octave];
}

export function toMidiPitchNumber(pitch: string): number {
    const [letter, acc, octave] = getMidiPitchParts(pitch);
    const step = LETTERS.indexOf(letter.toUpperCase());
    const alteration = acc[0] === "b" ? -acc.length : acc.length;
    const position = SEMITONES[step] + alteration;
    return C0 + position + 12 * octave;
}
