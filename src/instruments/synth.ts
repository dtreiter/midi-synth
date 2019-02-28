import {EventBus, EventPayload} from '../event_bus.js'
import {KNOB_TURN, KnobTurnPayload, NOTE_OFF, NOTE_ON, NoteOffPayload, NoteOnPayload, PITCH_BEND, PitchBendPayload} from '../midi/events.js';
import {NoteService} from '../services/note_service.js';

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
    const gainValue = this.noteService.gainForVelocity(velocity);
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
          this.noteService.frequencyForNote(note, this.pitchBend),
          this.audioContext.currentTime);
    }
  }

  private generateWaveform(note: number, velocity: number): OscillatorNode {
    const osc = this.audioContext.createOscillator();
    osc.type = this.waveform;
    osc.frequency.setValueAtTime(
        this.noteService.frequencyForNote(note, this.pitchBend),
        this.audioContext.currentTime);
    osc.start();

    return osc;
  }

  private cleanupNodes(note: number) {
    this.nodes[note].oscillatorNode.stop();
    delete this.nodes[note];
  }
}
