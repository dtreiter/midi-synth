import {EventBus, EventPayload} from './event_bus.js'
import {KNOB_TURN, KnobTurnPayload, NOTE_OFF, NOTE_ON, NoteOffPayload, NoteOnPayload, PITCH_BEND, PitchBendPayload} from './midi/events.js';

export const WAVEFORMS: OscillatorType[] = [
  'sine',
  'triangle',
  'square',
  'sawtooth',
];

interface Nodes {
  [key: number]: {
    gainNode: GainNode,
    oscillatorNode: OscillatorNode,
  };
}

export class Synth {
  attack = 10;  // Range from (0, 127).
  decay = 127;  // Range from (0, 127).
  waveform = WAVEFORMS[0];

  private nodes: Nodes = {};
  private notesToFreq: number[];
  private pitchBend: number = 0;  // Range from (-64, 63).

  constructor(
      private readonly audioContext: AudioContext,
      private readonly eventBus: EventBus,
  ) {
    this.notesToFreq = this.computeNoteTable();

    this.bindEvents();
  }

  private bindEvents() {
    this.eventBus.listen(KNOB_TURN, this.handleKnobTurn.bind(this));
    this.eventBus.listen(NOTE_ON, this.noteOn.bind(this));
    this.eventBus.listen(NOTE_OFF, this.noteOff.bind(this));
    this.eventBus.listen(PITCH_BEND, this.handlePitchBend.bind(this));
  }

  private handleKnobTurn(knobTurnEvent: EventPayload<KnobTurnPayload>) {
    const {knob, value} = knobTurnEvent.detail;
    if (knob === 0) {
      this.waveform = WAVEFORMS[value % WAVEFORMS.length];
    } else if (knob === 1) {
      this.attack = value;
    } else if (knob === 2) {
      this.decay = value;
    }
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

  private computeFrequency(note: number): number {
    // See the formula mentioned in `computeNoteTable`.
    const f_0 = this.notesToFreq[note];
    const a = Math.pow(2, 1 / 12);
    // Convert value range to (-2, 2) to represent semitones.
    const n = this.pitchBend / 32;

    return f_0 * Math.pow(a, n);
  }

  private noteOn(noteOnEvent: EventPayload<NoteOnPayload>) {
    const {note, velocity} = noteOnEvent.detail;
    const attackTime = 0.2 * ((this.attack + 1) / 128) + 0.01;

    // From the DLS LEVEL 1 spec:
    //   The MIDI Note Velocity value is converted to attenuation in dB by the
    //   Concave Transform according to the following formula:
    //     atten_dB = 20 × log_10(127^2 / velocity^2)
    //
    // Converting this from dB to a linear gain factor leads to:
    //   gain = velocity^2 / 127^2
    const gainValue = velocity ** 2 / 127 ** 2;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        gainValue, this.audioContext.currentTime + attackTime);

    const oscillatorNode = this.generateWaveform(note, velocity);
    // const oscillatorNode = this.generateKarplus(note, velocity);
    oscillatorNode.connect(gainNode);
    this.nodes[note] = {
      gainNode,
      oscillatorNode,
    };
  }

  private generateWaveform(note: number, velocity: number): OscillatorNode {
    const osc = this.audioContext.createOscillator();
    osc.type = this.waveform;
    osc.frequency.setValueAtTime(
        this.computeFrequency(note), this.audioContext.currentTime);
    osc.start();

    return osc;
  }

  private generateKarplus(note: number, velocity: number) {
    const frequency = this.notesToFreq[note];
    let impulse = 0.001 * this.audioContext.sampleRate;

    const node = this.audioContext.createScriptProcessor(4096, 0, 1);
    const N = Math.round(this.audioContext.sampleRate / frequency);
    const y = new Float32Array(N);
    let n = 0;
    node.onaudioprocess =
        function(e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < e.outputBuffer.length; ++i) {
        var xn = (--impulse >= 0) ? Math.random() - 0.5 : 0;
        output[i] = y[n] = xn + (y[n] + y[(n + 1) % N]) / 2;
        if (++n >= N) n = 0;
      }
    }

    return node;
  }

  private noteOff(noteOffEvent: EventPayload<NoteOffPayload>) {
    const {note} = noteOffEvent.detail;
    const decayTime = 2 * ((this.decay + 1) / 128) + 0.01;
    this.nodes[note].gainNode.gain.exponentialRampToValueAtTime(
        1E-15, this.audioContext.currentTime + decayTime);
    this.nodes[note].gainNode.gain.setValueAtTime(
        0, this.audioContext.currentTime + decayTime);
    this.cleanupNodes(note);
  }

  private handlePitchBend(pitchBendEvent: EventPayload<PitchBendPayload>) {
    const {value} = pitchBendEvent.detail;
    this.pitchBend = value;
    for (const key of Object.keys(this.nodes)) {
      const note = Number(key);
      const osc = this.nodes[note].oscillatorNode;
      osc.frequency.setValueAtTime(
          this.computeFrequency(note), this.audioContext.currentTime);
    }
  }

  private cleanupNodes(note: number) {
    this.nodes[note].oscillatorNode.stop();
    delete this.nodes[note];
  }
}
