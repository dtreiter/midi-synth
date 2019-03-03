import {defineCustomElements} from './custom_elements/definitions.js';
import {EventBus} from './event_bus.js';
import {KarplusStrong} from './instruments/karplus_strong.js';
import {Synth} from './instruments/synth.js';
import {MidiHandler} from './midi/midi.js';
import {InstrumentService} from './services/instrument_service.js';
import {NoteService} from './services/note_service.js';
import {Store} from './store/store.js';

const eventBus = new EventBus();
const noteService = new NoteService();
const midiHandler = new MidiHandler(eventBus);
const synth = new Synth(new AudioContext(), eventBus, noteService);
const karplus = new KarplusStrong(new AudioContext(), eventBus, noteService);
const instrumentService = new InstrumentService(eventBus, karplus, synth);

defineCustomElements(eventBus);

// Note, this must come last or the initialize event won't be received by the
// panel.
const store = new Store(eventBus);
