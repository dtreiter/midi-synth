export class SynthPanel extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  private get attack(): number {
    if (!this.hasAttribute('attack')) {
      throw new Error('synth-panel requires attribute: `attack`');
    }
    return Number(this.getAttribute('attack'));
  }

  private get decay(): number {
    if (!this.hasAttribute('decay')) {
      throw new Error('synth-panel requires attribute: `decay`');
    }
    return Number(this.getAttribute('decay'));
  }

  private get waveform(): string {
    if (!this.hasAttribute('waveform')) {
      throw new Error('synth-panel requires attribute: `waveform`');
    }
    return String(this.getAttribute('waveform'));
  }

  private render(): void {
    this.innerHTML = `
      <h2>Waveform Synthesis</h2>
      <p>
        <b>Waveform:</b> ${this.waveform}
      </p>
      <p>
        <radial-knob label="Attack" value="${this.attack}"></radial-knob>
      </p>
      <p>
        <radial-knob label="Decay" value="${this.decay}"></radial-knob>
      </p>
    `;
  }
}
