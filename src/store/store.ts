import {EventBus, EventPayload} from '../event_bus.js';
import {STORE_CHANGE, STORE_INITIALIZED} from './events.js';
import {KNOB_TURN, NOTE_ON, NOTE_OFF, KnobTurnPayload, NoteOffPayload, NoteOnPayload} from '../midi/events.js';

export interface StoreState {
  notes: number[];
  knobs: [number, number];
}

export class Store {
  private state: StoreState = {
    notes: [],
    knobs: [0, 0],
  };

  constructor(
    private readonly eventBus: EventBus,
  ) {
    this.bindEvents();
    this.eventBus.emit(STORE_INITIALIZED, this.state);
  }

  private bindEvents() {
    this.eventBus.listen(KNOB_TURN, this.knobTurn.bind(this));
    this.eventBus.listen(NOTE_ON, this.noteOn.bind(this));
    this.eventBus.listen(NOTE_OFF, this.noteOff.bind(this));
  }

  emitChange() {
    this.eventBus.emit(STORE_CHANGE, this.state);
  }

  /**
   * @param {KnobTurnEvent} note
   */
   knobTurn(knobTurnEvent: EventPayload<KnobTurnPayload>) {
    const {knob, value} = knobTurnEvent.detail;
    this.state.knobs[knob] = value;
    this.emitChange();
  }

  /**
   * @param {NoteOnEvent} note
   */
   noteOn(noteOnEvent: EventPayload<NoteOnPayload>) {
    const {note, velocity} = noteOnEvent.detail;
    this.state.notes.push(note);
    this.emitChange();
  }

  /**
   * @param {NoteOffEvent} note
   */
  noteOff(noteOffEvent: EventPayload<NoteOffPayload>) {
    const {note} = noteOffEvent.detail;
    this.state.notes = this.state.notes.filter((n) => n !== note);
    this.emitChange();
  }
}
