import {defineCustomElements} from './custom_elements/definitions.js';
import {EventBus} from './event_bus.js';
import {KarplusStrong} from './instruments/karplus_strong.js';
import {Synth} from './instruments/synth.js';
import {MidiHandler} from './midi/midi.js';
import {InstrumentService} from './services/instrument_service.js';
import {NoteService} from './services/note_service.js';
import {Store} from './store/store.js';

const audioContext = new AudioContext();
const eventBus = new EventBus();
const noteService = new NoteService();
const midiHandler = new MidiHandler(eventBus);
const karplus = new KarplusStrong(audioContext, eventBus, noteService);
const synth = new Synth(audioContext, eventBus, noteService);
const instrumentService = new InstrumentService(eventBus, karplus, synth);

defineCustomElements(eventBus);

// Note, this must come last or the initialize event won't be received by the
// panel.
const store = new Store(eventBus);
