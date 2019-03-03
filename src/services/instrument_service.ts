import {SWITCH_INSTRUMENT, SwitchInstrumentPayload} from '../custom_elements/instrument_selector/events.js';
import {EventBus, EventPayload} from '../event_bus.js';
import {Instrument, InstrumentType} from '../instruments/instrument.js';
import {KarplusStrong} from '../instruments/karplus_strong.js';
import {Synth} from '../instruments/synth.js';
import {STORE_INITIALIZED} from '../store/events.js';
import {StoreState} from '../store/store.js';

interface CurrentInstrument {
  instrumentType: InstrumentType|null;
  instrument: Instrument|null;
}

export class InstrumentService {
  private currentInstrument: CurrentInstrument = {
    instrumentType: null,
    instrument: null,
  };
  private instruments: {[key in InstrumentType]: Instrument};

  constructor(
      private readonly eventBus: EventBus,
      karplus: KarplusStrong,
      synth: Synth,
  ) {
    this.bindEvents();

    this.instruments = {
      [InstrumentType.KARPLUS]: karplus,
      [InstrumentType.SYNTH]: synth,
    };
  }

  initialize(storeInitializedEvent: EventPayload<StoreState>) {
    const {instrument} = storeInitializedEvent.detail;

    this.enableInstrument(instrument);
  }

  switchInstrument(switchInstrumentEvent:
                       EventPayload<SwitchInstrumentPayload>) {
    const {instrument} = switchInstrumentEvent.detail;

    if (instrument !== this.currentInstrument.instrumentType) {
      this.enableInstrument(instrument);
    }
  }

  private enableInstrument(instrumentType: InstrumentType) {
    if (this.currentInstrument.instrument) {
      this.currentInstrument.instrument.disable();
    }
    this.currentInstrument = {
      instrumentType: instrumentType,
      instrument: this.instruments[instrumentType],
    };
    if (this.currentInstrument.instrument) {
      this.currentInstrument.instrument.enable();
    }
  }

  private bindEvents() {
    this.eventBus.listen(STORE_INITIALIZED, this.initialize.bind(this));
    this.eventBus.listen(SWITCH_INSTRUMENT, this.switchInstrument.bind(this));
  }
}
