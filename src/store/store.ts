import {SWITCH_INSTRUMENT, SwitchInstrumentPayload} from '../custom_elements/instrument_selector/events.js'
import {EventBus, EventPayload} from '../event_bus.js';
import {InstrumentType} from '../instruments/instrument.js';
import {KNOB_TURN, KnobTurnPayload, NOTE_OFF, NOTE_ON, NoteOffPayload, NoteOnPayload} from '../midi/events.js';

import {STORE_CHANGE, STORE_INITIALIZED} from './events.js';

export interface StoreState {
  instrument: InstrumentType;
  notes: number[];
  knobs: [number, number, number];
}

export class Store {
  private state: StoreState = {
    instrument: InstrumentType.SYNTH,
    notes: [],
    knobs: [0, 0, 0],
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
    this.eventBus.listen(SWITCH_INSTRUMENT, this.switchInstrument.bind(this));
  }

  emitChange() {
    this.eventBus.emit(STORE_CHANGE, this.state);
  }

  knobTurn(knobTurnEvent: EventPayload<KnobTurnPayload>) {
    const {knob, value} = knobTurnEvent.detail;
    this.state.knobs[knob] = value;
    this.emitChange();
  }

  noteOn(noteOnEvent: EventPayload<NoteOnPayload>) {
    const {note, velocity} = noteOnEvent.detail;
    this.state.notes.push(note);
    this.emitChange();
  }

  noteOff(noteOffEvent: EventPayload<NoteOffPayload>) {
    const {note} = noteOffEvent.detail;
    this.state.notes = this.state.notes.filter((n) => n !== note);
    this.emitChange();
  }

  switchInstrument(switchInstrumentEvent:
                       EventPayload<SwitchInstrumentPayload>) {
    const {instrument} = switchInstrumentEvent.detail;
    this.state.instrument = instrument;
    this.emitChange();
  }
}
