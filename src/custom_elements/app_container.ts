import {EventBus, EventPayload} from '../event_bus.js';
import {InstrumentType} from '../instruments/instrument.js';
import {WAVEFORMS} from '../instruments/synth.js';
import {STORE_CHANGE, STORE_INITIALIZED} from '../store/events.js';
import {StoreState} from '../store/store.js';

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
      const {instrument, knobs, notes} = storeChangeEvent.detail;

      const isKarplus = instrument === InstrumentType.KARPLUS;
      this.innerHTML = `
        <h1>MIDI-Synth</h1>
        <instrument-selector instrument="${instrument}"></instrument-selector>
        ${
          isKarplus ? `
              <karplus-panel impulseLength="${knobs[0] / 127}"
                             filterLength="${knobs[1] / 127}">
              </karplus-panel>` :
                      `
              <synth-panel attack="${knobs[1] / 127}"
                           decay="${knobs[2] / 127}"
                           waveform="${WAVEFORMS[knobs[0] % WAVEFORMS.length]}">
              </synth-panel>`}
      `
    }
  }
}
