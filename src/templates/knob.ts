export interface KnobParams {
  label: string;
  value: string|number;
}

export function knob(params: KnobParams) {
  return `
    <b>${params.label}:</b>
    <input type="range"
           min="0"
           max="127"
           value="${params.value}">
  `;
}
