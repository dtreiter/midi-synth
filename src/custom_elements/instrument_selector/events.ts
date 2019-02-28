import {InstrumentType} from '../../instruments/instrument_type.js';

export const SWITCH_INSTRUMENT = 'SWITCH_INSTRUMENT';

export interface SwitchInstrumentPayload {
  instrument: InstrumentType;
}
