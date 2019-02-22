import {EventBus, EventPayload} from '../event_bus.js';
import {STORE_CHANGE, STORE_INITIALIZED} from '../store/events.js';
import {StoreState} from '../store/store.js';
import {WAVEFORMS} from '../synth.js';

export function AppContainerFactory(eventBus: EventBus) {
  return class AppContainer extends HTMLElement {
    private eventBus: EventBus;

    constructor() {
      super();
      this.eventBus = eventBus;

      this.bindEvents();
    }

    private bindEvents() {
      this.eventBus.listen(STORE_CHANGE, this.render.bind(this));
      this.eventBus.listen(STORE_INITIALIZED, this.render.bind(this));
    }

    private render(storeChangeEvent: EventPayload<StoreState>) {
      const {knobs, notes} = storeChangeEvent.detail;

      this.innerHTML = `
        <synth-panel attack="${knobs[1] / 127}"
                     decay="${knobs[2] / 127}"
                     waveform="${WAVEFORMS[knobs[0] % WAVEFORMS.length]}">
        </synth-panel>
      `
    }
  }
}
