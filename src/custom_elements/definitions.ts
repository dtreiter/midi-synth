import {EventBus} from '../event_bus.js';

import {AppContainerFactory} from './app_container.js';
import {RadialKnob} from './radial_knob.js';
import {SynthPanel} from './synth_panel.js';

export function defineCustomElements(eventBus: EventBus) {
  customElements.define('app-container', AppContainerFactory(eventBus));
  customElements.define('synth-panel', SynthPanel);
  customElements.define('radial-knob', RadialKnob);
}
