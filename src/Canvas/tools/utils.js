export const midPoint = (p1, p2) => ({
  x: p1.x + (p2.x - p1.x) / 2,
  y: p1.y + (p2.y - p1.y) / 2,
});

export const angle = (cx, cy, ex, ey) => {
  const dy = ey - cy;
  const dx = ex - cx;
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  return theta;
}

export const getCanvasMouseAngle = (canvas, mx, my) => {
  const { x: cx, y: cy } = getCanvasCenterPoint(canvas);
  return angle(cx, cy, mx, my);
}

export const getCanvasCenterPoint = (canvas) => {
  const { x, y, width, height } = canvas.getBoundingClientRect();
  return { x: x + width / 2, y: y + height / 2 };
}

export const getRelativeMousePosition = (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  return { x, y };
}

export const getAbsoluteMousePosition = (e) => (
  { x: e.screenX, y: e.screenY }
);

export const getRelativeMouseMovement = (e) => (
  { x: e.movementX, y: e.movementY }
);

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
