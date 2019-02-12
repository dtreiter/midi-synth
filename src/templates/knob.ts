export interface KnobParams {
  label: string;
  value: number;
}

export function knob(params: KnobParams) {
  const size = 24;
  const strokeWidth = 5;
  const radius = size - strokeWidth;
  const circumference = radius * 2 * Math.PI;
  const radialSpan = 0.85 * circumference;
  const minOffset = 0.05 * circumference;
  const offset = params.value * radialSpan + minOffset;

  return `
    <b>${params.label}</b>
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
