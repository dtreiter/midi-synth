import {EventBus, EventPayload} from '../event_bus.js';
import {STORE_CHANGE, STORE_INITIALIZED} from '../store/events.js';
import {StoreState} from '../store/store.js';
import {WAVEFORMS} from '../synth.js';
import {knob} from '../templates/knob.js';

export class Panel {
  constructor(
      private readonly container: HTMLElement,
      private readonly eventBus: EventBus,
  ) {
    this.bindEvents();
  }

  private bindEvents() {
    this.eventBus.listen(STORE_CHANGE, this.render.bind(this));
    this.eventBus.listen(STORE_INITIALIZED, this.render.bind(this));
  }

  render(storeChangeEvent: EventPayload<StoreState>): void {
    const {knobs, notes} = storeChangeEvent.detail;

    const template = `
      <p>
        <b>Note:</b> ${notes}
      </p>
      <p>
        <b>Waveform:</b> ${WAVEFORMS[knobs[0] % WAVEFORMS.length]}
      </p>
      <p>
        ${knob({label: 'Attack', value: knobs[1] / 127})}
      </p>
      <p>
        ${knob({label: 'Decay', value: knobs[2] / 127})}
      </p>
    `;

    this.container.innerHTML = template;
  }
}
