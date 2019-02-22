import {EventBus, EventPayload} from '../event_bus.js';
import {STORE_CHANGE, STORE_INITIALIZED} from '../store/events.js';
import {StoreState} from '../store/store.js';
import {WAVEFORMS} from '../synth.js';

export function ControlPanelFactory(eventBus: EventBus) {
  return class ControlPanel extends HTMLElement {
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

    render(storeChangeEvent: EventPayload<StoreState>): void {
      const {knobs, notes} = storeChangeEvent.detail;

      this.innerHTML = `
	<p>
	  <b>Note:</b> ${notes}
	</p>
	<p>
	  <b>Waveform:</b> ${WAVEFORMS[knobs[0] % WAVEFORMS.length]}
	</p>
	<p>
	  <radial-knob label="Attack" value="${knobs[1] / 127}"></radial-knob>
	</p>
	<p>
	  <radial-knob label="Decay" value="${knobs[2] / 127}"></radial-knob>
	</p>
      `;
    }
  }
}
