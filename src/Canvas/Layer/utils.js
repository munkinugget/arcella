export const midPoint = (p1, p2) => ({
  x: p1.x + (p2.x - p1.x) / 2,
  y: p1.y + (p2.y - p1.y) / 2,
});
