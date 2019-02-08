import {EventBus} from '../event_bus.js';
import {STORE_CHANGE, STORE_INITIALIZED} from '../store/events.js';
import {WAVEFORMS} from '../synth.js';

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

  // TODO (storeChangeEvent: StoreState)
  render(storeChangeEvent: any): void {
    const {knobs, notes} = storeChangeEvent.detail;

    const template = `
      <p>
        <b>Note:</b> ${notes}
      </p>
      <p>
        <b>Waveform:</b> ${WAVEFORMS[knobs[0] % WAVEFORMS.length]}
      </p>
      <p>
        <b>Attack:</b> ${knobs[1]}
      </p>
      <p>
        <b>Decay:</b> ${knobs[2]}
      </p>
    `;

    this.container.innerHTML = template;
  }
}
