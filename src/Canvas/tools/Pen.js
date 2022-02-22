export class Pen {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.x = 0;
    this.y = 0;
  }

  draw(e) {
    const x1 = this.x;
    const x2 = e.clientX;
    const y1 = this.y;
    const y2 = e.clientY;
    
    if (Math.hypot(x2-x1, y2-y1) < 3) return; 
    
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3 * 2;
    this.ctx.moveTo(x1, y1);
    // const mid = midPoint(position, currentPosition);
    // ctx.quadraticCurveTo(position.x, position.y, mid.x, mid.y);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    this.x = x2;
    this.y = y2;
  }

  start(e) {
    if (e.buttons === 1) {
      this.x = e.clientX;
      this.y = e.clientY;
    }
  }

  end(e) {
    if (e.buttons !== 1) return;
    this.ctx.putTag();
  }

  enable(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.canvas.addEventListener('mousemove', draw);
    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mouseup', end);
  }

  disable() {
    this.canvas.removeEventListener('mousemove');
    this.canvas.removeEventListener('mousedown');
    this.canvas.removeEventListener('mouseup');
  }
}