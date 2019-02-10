export class NoteService {
  private notesToFreq: number[];

  constructor() {
    this.notesToFreq = this.computeNoteTable();
  }

  private computeNoteTable(): number[] {
    // The frequency of notes is given by:
    //   f_n = f_0 * a^n
    //
    // where:
    //   f_0: the frequency of one fixed note which must be
    //        defined. For example, A440.
    //
    //   n:   the number of half steps away from the fixed note. If a higher
    //        note, n is positive. If lower note, n is negative.
    //
    //   f_n: the frequency of the note n half steps away.
    //
    //   a:   the twelth root of 2 ~= 1.0594...

    const A440 = 69;  // The midi note for A440
    const f_0 = 440;
    const a = Math.pow(2, 1 / 12);

    const noteMap = [];
    for (let i = 0; i < 127; i++) {
      const n = i - A440;
      noteMap[i] = f_0 * Math.pow(a, n);
    }

    return noteMap;
  }

  /**
   * Computes the frequency for the provided note number and pitchBend value
   * (range in -64, 63).
   */
  getFrequencyForNote(note: number, pitchBend: number): number {
    // See the formula mentioned in `computeNoteTable`.
    const f_0 = this.notesToFreq[note];
    const a = Math.pow(2, 1 / 12);
    // Convert value range to (-2, 2) to represent semitones.
    const n = pitchBend / 32;

    return f_0 * Math.pow(a, n);
  }
}
