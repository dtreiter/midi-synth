import {KNOB_TURN, NOTE_ON, NOTE_OFF} from './events.js';
import {EventBus} from '../event_bus';

const CHANNEL_TO_KNOB_MAP: {[key: number]: number} = {
  71: 0,
  74: 1,
  84: 2,
  7: 3,
  91: 4,
  93: 5,
  5: 6,
  10: 7,
};

export class MidiHandler {
  constructor(
    private readonly eventBus: EventBus,
  ) {
    navigator.requestMIDIAccess()
      .then(this.setupHandler.bind(this))
      .catch((err) => {
        throw new Error(err);
      });
  }

  setupHandler(midiAccess: WebMidi.MIDIAccess) {
    for (let input of midiAccess.inputs.values()) {
      input.onmidimessage = this.handleMessage.bind(this);
    }
  }

  handleMessage(messageEvent: WebMidi.MIDIMessageEvent) {
    if (!messageEvent.data) return;

    const message = messageEvent.data;
    const command = message[0];

    if (command === 144) {
      const note = message[1];
      const velocity = message[2];
      if (velocity === 0) {
        this.eventBus.emit(NOTE_OFF, {note});
      } else {
        this.eventBus.emit(NOTE_ON, {note, velocity});
      }
    } else if (command === 128) {
      const note = message[1];
      this.eventBus.emit(NOTE_OFF, {note});
    } else if (command === 176) {
      const [_, channel, value] = message;
      const knob = CHANNEL_TO_KNOB_MAP[channel];
      this.eventBus.emit(KNOB_TURN, {knob, value});
    } else {
      console.log(command, messageEvent);
    }
  }
}