import {EventBus, EventPayload} from '../event_bus.js'
import {KNOB_TURN, KnobTurnPayload, NOTE_OFF, NOTE_ON, NoteOffPayload, NoteOnPayload} from '../midi/events.js';
import {NoteService} from '../services/note_service.js';
import {Instrument} from './instrument.js';

interface Nodes {
  [key: number]: ScriptProcessorNode;
}

/**
 * Simple Karplus-Strong implementation using a white-noise impulse and moving
 * average low-pass filter. The size of the impulse and number of samples in the
 * filter are controllable.
 * NOTE: Currently does not support pitch bend or velocity.
 */
export class KarplusStrong implements Instrument {
  impulseLength = 0.3;
  filterLength = 5;

  private nodes: Nodes = {};

  constructor(
      private readonly audioContext: AudioContext,
      private readonly eventBus: EventBus,
      private readonly noteService: NoteService,
  ) {
    this.bindEvents();
  }

  enable() {
    this.eventBus.listen(KNOB_TURN, this.handleKnobTurn);
    this.eventBus.listen(NOTE_ON, this.noteOn);
    this.eventBus.listen(NOTE_OFF, this.noteOff);
  }

  disable() {
    this.eventBus.unlisten(KNOB_TURN, this.handleKnobTurn);
    this.eventBus.unlisten(NOTE_ON, this.noteOn);
    this.eventBus.unlisten(NOTE_OFF, this.noteOff);
  }

  private bindEvents() {
    this.handleKnobTurn = this.handleKnobTurn.bind(this);
    this.noteOn = this.noteOn.bind(this);
    this.noteOff = this.noteOff.bind(this);
  }

  private handleKnobTurn(knobTurnEvent: EventPayload<KnobTurnPayload>) {
    const {knob, value} = knobTurnEvent.detail;
    if (knob === 0) {
      this.impulseLength = value / 127;
    } else if (knob === 1) {
      this.filterLength = value + 2;
    }
  }

  private noteOn(noteOnEvent: EventPayload<NoteOnPayload>) {
    const {note, velocity} = noteOnEvent.detail;
    const scriptNode = this.generateKarplus(note, velocity);
    scriptNode.connect(this.audioContext.destination);
    this.nodes[note] = scriptNode;
  }

  private noteOff(noteOffEvent: EventPayload<NoteOffPayload>) {
    const {note} = noteOffEvent.detail;
    this.cleanupNodes(note);
  }

  private generateKarplus(note: number, velocity: number): ScriptProcessorNode {
    const frequency = this.noteService.frequencyForNote(note, 0);

    // The required phase delay D for a given fundamental frequency f_0 is
    // calculated according to D = f_s/f_0 where f_s is the sampling frequency.
    const D = Math.round(this.audioContext.sampleRate / frequency);

    // Buffer of size D which we will inject an impulse into, low-pass filter,
    // and repeat in the output buffer every D samples.
    const y = new Float32Array(D);

    let impulseSamples = this.impulseLength * D;
    let n = 0;

    const node = this.audioContext.createScriptProcessor(512, 0, 1);
    node.onaudioprocess =
        (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < e.outputBuffer.length; i++) {
            // We low-pass filter the signal by averaging consecutive samples.
            let sum = 0
            for (let j = 0; j < this.filterLength; j++) {
              sum += y[(n + j) % D];
            }
            y[n] = sum / this.filterLength;

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

  private cleanupNodes(note: number) {
    this.nodes[note].disconnect();
    delete this.nodes[note];
  }
}
