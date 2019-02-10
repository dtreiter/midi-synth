import {EventBus, EventPayload} from './event_bus.js'
import {KNOB_TURN, KnobTurnPayload, NOTE_OFF, NOTE_ON, NoteOffPayload, NoteOnPayload, PITCH_BEND, PitchBendPayload} from './midi/events.js';
import {NoteService} from './services/note_service.js';

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
  private pitchBend: number = 0;  // Range from (-64, 63).

  constructor(
      private readonly audioContext: AudioContext,
      private readonly eventBus: EventBus,
      private readonly noteService: NoteService,
  ) {
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
        this.noteService.getFrequencyForNote(note, this.pitchBend),
        this.audioContext.currentTime);
    osc.start();

    return osc;
  }

  private generateKarplus(note: number, velocity: number): ScriptProcessorNode {
    const frequency =
        this.noteService.getFrequencyForNote(note, this.pitchBend);

    // The required phase delay D for a given fundamental frequency f_0 is
    // calculated according to D = f_s/f_0 where f_s is the sampling frequency.
    const D = Math.round(this.audioContext.sampleRate / frequency);

    // Buffer of size D which we will inject an impulse into, low-pass filter,
    // and repeat in the output buffer every D samples.
    const y = new Float32Array(D);

    let impulseSamples = D / 3;
    let n = 0;

    const node = this.audioContext.createScriptProcessor(512, 0, 1);
    node.onaudioprocess =
        (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < e.outputBuffer.length; i++) {
            // We low-pass filter the signal by averaging consecutive samples.
            y[n] = (y[n] + y[(n + 1) % D]) / 2;

            if (impulseSamples >= 0) {
              // Use random noise for the impulse for `impulseSamples` number of
              // samples.
              impulseSamples -= 1;
              y[n] += Math.random() - 0.5;
            }

            output[i] = y[n];

            n += 1;
            if (n >= D) {
              n = 0;
            }
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
          this.noteService.getFrequencyForNote(note, this.pitchBend),
          this.audioContext.currentTime);
    }
  }

  private cleanupNodes(note: number) {
    this.nodes[note].oscillatorNode.stop();
    delete this.nodes[note];
  }
}
