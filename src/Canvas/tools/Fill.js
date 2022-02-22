import FloodFill from 'q-floodfill';

export class Fill {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  fill(e) {
    const img = this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
    const floodFill = new FloodFill(img);
    floodFill.fill('#000000', e.clientX, e.clientY);
    this.ctx.putImageData(floodFill.imageData, 0, 0);
  }

  enable(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    canvas.addEventListener('click', fill);
  }

  disable() {
    this.canvas.removeEventListener('click');
  }
}