import {EventBus} from '../../event_bus.js';
import {InstrumentType} from '../../instruments/instrument.js';

import {SWITCH_INSTRUMENT} from './events.js';

export function InstrumentSelectorFactory(eventBus: EventBus) {
  return class InstrumentSelector extends HTMLElement {
    private eventBus: EventBus;

    constructor() {
      super();
      this.eventBus = eventBus;

      this.render();
    }

    private selectSynth(e: Event) {
      this.eventBus.emit(SWITCH_INSTRUMENT, {
        instrument: InstrumentType.SYNTH,
      });
    }

    private selectKarplus(e: Event) {
      this.eventBus.emit(SWITCH_INSTRUMENT, {
        instrument: InstrumentType.KARPLUS,
      });
    }

    private makeButton(label: string, handler: (e: Event) => void) {
      const button = document.createElement('button');
      button.onclick = handler.bind(this);
      button.innerHTML = label;
      return button;
    }

    private render() {
      const karplusButton =
          this.makeButton('Karplus-Strong', this.selectKarplus);
      const synthButton =
          this.makeButton('Waveform Synthesis', this.selectSynth);

      this.append(karplusButton);
      this.append(synthButton);
    }
  };
}
