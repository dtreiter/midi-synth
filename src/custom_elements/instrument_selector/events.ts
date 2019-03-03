import {InstrumentType} from '../../instruments/instrument.js';

export const SWITCH_INSTRUMENT = 'SWITCH_INSTRUMENT';

export interface SwitchInstrumentPayload {
  instrument: InstrumentType;
}
