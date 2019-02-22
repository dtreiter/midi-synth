export class RadialKnob extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get label(): string {
    if (!this.hasAttribute('label')) {
      throw new Error('radial-knob requires attribute: `label`');
    }
    return String(this.getAttribute('label'));
  }

  get value(): number {
    if (!this.hasAttribute('value')) {
      throw new Error('radial-knob requires attribute: `value`');
    }
    return Number(this.getAttribute('value'));
  }

  render() {
    const size = 24;
    const strokeWidth = 5;
    const radius = size - strokeWidth;
    const circumference = radius * 2 * Math.PI;
    const radialSpan = 0.85 * circumference;
    const minOffset = 0.05 * circumference;
    const offset = this.value * radialSpan + minOffset;

    this.innerHTML = `
      <b>${this.label}</b>
      <svg height="${size * 2}"
	  width="${size * 2}">
	<circle stroke-width="${strokeWidth}"
		stroke="black"
		fill="transparent"
		stroke-dasharray="${offset} ${circumference}"
		transform="rotate(108)"
		transform-origin="50% 50%"
		r="${radius}"
		cx="${size}"
		cy="${size}"/>
      </svg>
    `;
  }
}
