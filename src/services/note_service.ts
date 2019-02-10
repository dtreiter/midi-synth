export class NoteService {
  private notesToFreq: number[];

  constructor() {
    this.notesToFreq = this.computeNoteTable();
  }

  private computeNoteTable(): number[] {
    // The frequency of notes is given by:
    //   fn = f0 * a^n
    //
    // where:
    //   f0: the frequency of one fixed note which must be
    //       defined. For example, A440.
    //
    //   n:  the number of half steps away from the fixed note. If a higher
    //       note, n is positive. If lower note, n is negative.
    //
    //   fn: the frequency of the note n half steps away.
    //
    //   a:  the twelth root of 2 ~= 1.0594...

    const A440 = 69;  // The midi note for A440
    const f0 = 440;
    const a = Math.pow(2, 1 / 12);

    const noteMap = [];
    for (let i = 0; i < 127; i++) {
      const n = i - A440;
      noteMap[i] = f0 * Math.pow(a, n);
    }

    return noteMap;
  }

  /**
   * Computes the frequency for the provided note number and pitch bend value
   * (range in -64, 63).
   */
  frequencyForNote(note: number, pitchBend: number): number {
    // See the formula mentioned in `computeNoteTable`.
    const f0 = this.notesToFreq[note];
    const a = Math.pow(2, 1 / 12);
    // Convert value range to (-2, 2) to represent semitones.
    const n = pitchBend / 32;

    return f0 * Math.pow(a, n);
  }

  /**
   * Computes a linear gain factor given a MIDI velocity in range 0, 127.
   */
  gainForVelocity(velocity: number): number {
    // From the DLS LEVEL 1 spec:
    //   The MIDI Note Velocity value is converted to attenuation in dB by the
    //   Concave Transform according to the following formula:
    //     atten_dB = 20 × log_10(127^2 / velocity^2)
    //
    // Converting this from dB to a linear gain factor leads to:
    //   gain = velocity^2 / 127^2
    return velocity ** 2 / 127 ** 2;
  }
}
