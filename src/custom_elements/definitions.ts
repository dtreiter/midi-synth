import {EventBus} from '../event_bus.js';
import {ControlPanelFactory} from './control_panel.js';
import {RadialKnob} from './radial_knob.js';

export function defineCustomElements(eventBus: EventBus) {
  customElements.define('control-panel', ControlPanelFactory(eventBus));
  customElements.define('radial-knob', RadialKnob);
}
