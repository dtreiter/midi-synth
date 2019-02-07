import {EventBus, EventPayload} from './event_bus.js'
import {KNOB_TURN, NOTE_ON, NOTE_OFF, KnobTurnPayload, NoteOffPayload, NoteOnPayload} from './midi/events.js';

export const WAVEFORMS: OscillatorType[] = [
  'sine',
  'triangle',
  'square',
  'sawtooth',
];

export class Synth {
  attack = 10;  // Range from 0-127.
  decay = 127;  // Range from 0-127.
  waveform = WAVEFORMS[0];

  private nodes: {[key: number]: GainNode} = {};
  private notesToFreq: number[];

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
  }

  /**
   * @param {KnobTurnEvent} note
   */
   handleKnobTurn(knobTurnEvent: EventPayload<KnobTurnPayload>) {
    const {knob, value} = knobTurnEvent.detail;
    if (knob === 0) {
      this.waveform = WAVEFORMS[value % WAVEFORMS.length];
    } else if (knob === 1) {
      this.attack = value;
    } else if (knob === 2) {
      this.decay = value;
    }
  }

  /**
   * @return {Array<number>}
   */
  computeNoteTable() {
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
    const a = Math.pow(2, 1/12);

    const noteMap = [];
    for (let i = 0; i < 127; i++) {
      const n = i - A440;
      noteMap[i] = f_0 * Math.pow(a, n);
    }

    return noteMap;
  }

  noteOn(noteOnEvent: EventPayload<NoteOnPayload>) {
    const {note, velocity} = noteOnEvent.detail;
    const attackTime = 0.2 * ((this.attack + 1) / 128) + 0.01;

    // From the DLS LEVEL 1 spec:
    //   The MIDI Note Velocity value is converted to attenuation in dB by the
    //   Concave Transform according to the following formula:
    //     atten_dB = 20 × log_10(127^2 / velocity^2)
    //
    // Converting this from dB to a linear gain factor leads to:
    //   gain = velocity^2 / 127^2
    const gainValue = velocity**2 / 127**2;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        gainValue, this.audioContext.currentTime + attackTime);

    const node = this.generateWaveform(note, velocity);
    // const node = this.generateKarplus(note, velocity);
    node.connect(gainNode);
    this.nodes[note] = gainNode;
  }

  generateWaveform(note: number, velocity: number): OscillatorNode {
    const osc = this.audioContext.createOscillator();
    osc.type = this.waveform;
    osc.frequency.setValueAtTime(
      this.notesToFreq[note], this.audioContext.currentTime);
    osc.start();

    return osc;
  }

  generateKarplus(note: number, velocity: number) {
    const frequency = this.notesToFreq[note];
    let impulse = 0.001 * this.audioContext.sampleRate;
    
    const node = this.audioContext.createScriptProcessor(4096, 0, 1);
    const N = Math.round(this.audioContext.sampleRate / frequency);
    const y = new Float32Array(N);
    let n = 0;
    node.onaudioprocess = function (e) {
      var output = e.outputBuffer.getChannelData(0);
      for (var i = 0; i < e.outputBuffer.length; ++i) {
        var xn = (--impulse >= 0) ? Math.random()-0.5 : 0;
        output[i] = y[n] = xn + (y[n] + y[(n + 1) % N]) / 2;
        if (++n >= N) n = 0;
      }
    }
    
    return node;
  }

  noteOff(noteOffEvent: EventPayload<NoteOffPayload>) {
    const {note} = noteOffEvent.detail;
    const decayTime = 2 * ((this.decay + 1) / 128) + 0.01;
    this.nodes[note].gain.exponentialRampToValueAtTime(
        1E-15, this.audioContext.currentTime + decayTime);
    this.nodes[note].gain.setValueAtTime(
        0, this.audioContext.currentTime + decayTime);
    delete this.nodes[note];
  }
}
