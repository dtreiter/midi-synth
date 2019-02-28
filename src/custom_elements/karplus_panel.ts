export class KarplusPanel extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  private get impulseLength(): number {
    if (!this.hasAttribute('impulseLength')) {
      throw new Error('karplus-panel requires attribute: `impulseLength`');
    }
    return Number(this.getAttribute('impulseLength'));
  }

  private get filterLength(): number {
    if (!this.hasAttribute('filterLength')) {
      throw new Error('karplus-panel requires attribute: `filterLength`');
    }
    return Number(this.getAttribute('filterLength'));
  }

  private render(): void {
    this.innerHTML = `
      <h2>Physical Modeling with Karplus-Strong</h2>
      <p>
        <radial-knob label="Impulse Length" value="${this.impulseLength}">
        </radial-knob>
      </p>
      <p>
        <radial-knob label="Filter Length" value="${this.filterLength}">
        </radial-knob>
      </p>
    `;
  }
}
