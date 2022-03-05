import { Component, createRef, useEffect, useRef, useState } from "react";
import FloodFill from 'q-floodfill';
import UndoCanvas from 'undo-canvas';
import keyboardJS from 'keyboardjs';

export class Layer extends Component {
  constructor(props) {
    super(props);
    this.active = props.active;
    this.zIndex = props.zIndex || 0;
    this.x = 0;
    this.y = 0;
    this.canvasRef = createRef();
    this.ctx = null;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    const canvas = this.canvasRef.current;
    const context = canvas.getContext('2d');
    // context.imageSmoothingQuality = 'high';
    UndoCanvas.enableUndo(context);
    this.ctx = context;
    this.ctx.putTag(); // Initial history state

    keyboardJS.bind('ctrl + z', () => {
      this.ctx.undoTag();
    });
    keyboardJS.bind('ctrl + y', () => {
      this.ctx.redoTag();
    });
  }

  continueLineSegment(e) {
    const point = { x: e.clientX, y: e.clientY };
    
    if (point.x === this.x && point.y === this.y) return; 
    
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3 * 2;
    this.ctx.moveTo(this.x, this.y);
    // const x1 = (this.x + point.x) / 2;
    // const y1 = (this.y + point.y) / 2;
    // const mid = midPoint(position, currentPosition);
    // this.ctx.quadraticCurveTo(this.x, this.y, x1, y1);
    // this.ctx.quadraticCurveTo(x1, y1, point.x, point.y);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    
    this.x = point.x;
    this.y = point.y;
  }
  
  handleMouseDown(e) {
    if (this.active && e.buttons === 1) {
      this.x = e.clientX;
      this.y = e.clientY;
    }

    if (this.active && e.buttons === 2) {
      const canvas = this.canvasRef.current;
      const img = this.ctx.getImageData(0,0, canvas.width, canvas.height);
      const floodFill = new FloodFill(img);
      floodFill.fill('#000000', e.clientX, e.clientY);
      this.ctx.putImageData(floodFill.imageData, 0, 0);
    }
  }

  handleMouseUp(e) {
    if (!this.active && e.buttons !== 1) return;
    this.ctx.putTag();

  }

  handleMouseMove(e) {
    if (!this.active || e.buttons !== 1) return;
    this.continueLineSegment(e);
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        width={800}
        height={600}
        style={{ zIndex: this.zIndex, position: 'absolute', border: '1px solid #000000' }}
      />
    );
  }
}
