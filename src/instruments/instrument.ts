export interface Instrument {
  enable: () => void;
  disable: () => void;
}

export enum InstrumentType {
  KARPLUS,
  SYNTH,
}
