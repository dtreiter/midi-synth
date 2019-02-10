import {EventBus} from './event_bus.js';
import {MidiHandler} from './midi/midi.js';
import {Panel} from './panel/panel.js';
import {Store} from './store/store.js';
import {Synth} from './synth.js';
import {NoteService} from './services/note_service.js';

const eventBus = new EventBus();
const noteService = new NoteService();
const midiHandler = new MidiHandler(eventBus);
const synth = new Synth(new AudioContext(), eventBus, noteService);

const appContainer = document.querySelector('#app') as HTMLElement;
const panel = new Panel(appContainer, eventBus);

// Note, this must come last or the initialize event won't be received by the
// panel.
const store = new Store(eventBus);
