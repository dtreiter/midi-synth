export const NOTE_ON = 'MIDI_NOTE_ON';
export const NOTE_OFF = 'MIDI_NOTE_OFF';
export const KNOB_TURN = 'MIDI_KNOB_TURN';
export const PITCH_BEND = 'MIDI_PITCH_BEND';

export interface KnobTurnPayload {
  knob: number;
  value: number;
}

export interface NoteOnPayload {
  note: number;
  velocity: number;
}

export interface NoteOffPayload {
  note: number;
}

export interface PitchBendPayload {
  value: number;
}
