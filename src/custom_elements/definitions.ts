import {EventBus} from '../event_bus.js';

import {AppContainerFactory} from './app_container.js';
import {InstrumentSelectorFactory} from './instrument_selector/instrument_selector.js';
import {KarplusPanel} from './karplus_panel.js';
import {RadialKnob} from './radial_knob.js';
import {SynthPanel} from './synth_panel.js';

export function defineCustomElements(eventBus: EventBus) {
  customElements.define('app-container', AppContainerFactory(eventBus));
  customElements.define('karplus-panel', KarplusPanel);
  customElements.define(
      'instrument-selector', InstrumentSelectorFactory(eventBus));
  customElements.define('synth-panel', SynthPanel);
  customElements.define('radial-knob', RadialKnob);
}
