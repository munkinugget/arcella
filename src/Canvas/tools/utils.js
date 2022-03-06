export const midPoint = (p1, p2) => ({
  x: p1.x + (p2.x - p1.x) / 2,
  y: p1.y + (p2.y - p1.y) / 2,
});

export const getRelativeMousePosition = (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  return { x, y };
}

export const colorToRgbaString = (color) => {
  const { r,g,b,a } = color.rgb;
  return `rgba(${r},${g},${b},${a})`;
}

export const rgbaStringToColor = (rgbaString) => {
  if (typeof rgbaString !== 'string') return undefined;
  const [r,g,b,a] = rgbaString.matchAll(/[\d\.]{1,3}/g);
  return {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10),
    a: parseFloat(a)
  };
}
