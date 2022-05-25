import { Component } from 'react';
import PropTypes from 'prop-types';
import { getRelativeMousePosition, getAbsoluteMousePosition, getRelativeMouseMovement, getCanvasMouseAngle } from './tools/utils';
import keyboardJS from 'keyboardjs';
import UndoCanvas from 'undo-canvas';
import FloodFill from 'q-floodfill';
import { Box } from '@mui/material';
import { keyboard } from '@testing-library/user-event/dist/keyboard';

export default class CompleteCanvas extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.ctx = null;
    this.memCanvas = null;
    this.memCtx = null;
    this.lastPosition = { x: 0, y: 0 };
    this.points = [];
    this.lastImageData = undefined;

    this.action = null;
    this.target = null;
    this.canvasX = 0;
    this.canvasY = 0;
    this.appX = 0;
    this.appY = 0;

    this.state = {
      canvasRotation: 0,
      canvasTranslateX: 0,
      canvasTranslateY: 0,
      canvasZoom: 1,
    };

    this.draggingCanvas = false;
  
    this.enableCanvas = this.enableCanvas.bind(this);
    this.startDraw = this.startDraw.bind(this);
    this.endDraw = this.endDraw.bind(this);
    this.draw = this.draw.bind(this);
    this.fill = this.fill.bind(this);
    this.pickColor = this.pickColor.bind(this);

    this.handleCanvasDrag = this.handleCanvasDrag.bind(this);
    this.handleCanvasRotation = this.handleCanvasRotation.bind(this);
    this.animationStep = this.animationStep.bind(this);
  }

  /*
  TODO
  
  Pan - hold space + click and drag to pan the canvas   
  Zoom - ctrl + + / ctrl + - to zoom in and out
  Rotate - ?
  */

  startDraw(e) {
    this.points = [];
    this.lastPosition = { x: this.canvasX, y: this.canvasY };
    // snapshot of the canvas before the stroke
    this.lastImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);   
                                                                                                                                                                                                                                                                                                                                       
    this.memCtx.lineCap = 'round';
    this.memCtx.strokeStyle = this.props.colors.foreground;
    this.memCtx.lineWidth = this.props.brush.size;

    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.props.colors.foreground;                                                                                                                                                                                
    this.ctx.lineWidth = this.props.brush.size;

    this.action = 'Brush';
    window.requestAnimationFrame(this.animationStep);
  }

  endDraw(e) {
    this.action = null;
    this.ctx.putTag();
  }

  draw() {
    const x1 = this.lastPosition.x;
    const x2 = this.canvasX;
    const y1 = this.lastPosition.y;
    const y2 = this.canvasY;
    
    if (Math.hypot(x2-x1, y2-y1) < 3) return; 
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
    
    this.lastPosition = { x: x2, y: y2 };
  }

  drawPoints() {
    this.points.push({
      x: this.canvasX,
      y: this.canvasY
    });
  
    if (this.points.length < 3) return;

    // clear memCtx
    this.memCtx.clearRect(0, 0, this.memCanvas.width, this.memCanvas.height);
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.putImageData(this.lastImageData, 0, 0);

    this.memCtx.beginPath();
    this.memCtx.moveTo(this.points[0].x, this.points[0].y);

    let i = 1;
    // draw a bunch of quadratics, using the average of two this.points as the control point
    for (; i < this.points.length - 2; i++) {
      const c = (this.points[i].x + this.points[i + 1].x) / 2;
      const d = (this.points[i].y + this.points[i + 1].y) / 2;
      this.memCtx.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
    }
  
    this.memCtx.quadraticCurveTo(
      this.points[i].x,
      this.points[i].y,
      this.points[i + 1].x,
      this.points[i + 1].y
    );

    this.memCtx.stroke();
    this.memCtx.closePath();

    const img = this.memCtx.getImageData(0, 0, this.memCanvas.width, this.memCanvas.height);
    this.ctx.putImageData(img, 0, 0);
  }

  fill(e) {
    const { x, y } = getRelativeMousePosition(e);
    const floodFill = new FloodFill(this.ctx.getImageData(0,0, this.canvas.width, this.canvas.height));
    floodFill.fill(this.props.colors.foreground, Math.floor(x), Math.floor(y));
    this.ctx.putImageData(floodFill.imageData, 0, 0);
    this.ctx.putTag();
  }

  pickColor(e) {
    const { x, y } = getRelativeMousePosition(e);
    const [r, g, b, a] = this.ctx.getImageData(x,y, 1, 1).data;
    this.props.updateColor(`rgba(${r},${g},${b},${a})`);
  }

  handleCanvasDrag(e) {
    if (e.buttons !== 1) return;
    const { x, y } = getRelativeMouseMovement(e);
    this.setState({
      ...this.state,
      canvasTranslateX: this.state.canvasTranslateX + x,
      canvasTranslateY: this.state.canvasTranslateY + y
    });
  }

  handleCanvasRotation(e) {
    const { x, y } = getAbsoluteMousePosition(e);
    const canvasRotation = getCanvasMouseAngle(this.canvas, x, y);

    this.setState({
      ...this.state,
      canvasRotation
    });
  }

  animationStep() {
    switch (this.action) {
      case 'Brush':
        this.drawPoints();
      break;
      case 'Erase':
        this.drawPoints();
      break;
      case 'Rotate':
        this.rotate();
      break;
      case 'Translate':
        this.translate();
      break;
    }

    if (this.action) {
      window.requestAnimationFrame(this.animationStep);
    }
  }

  enableCanvas(canvas) {
    if (this.canvas !== null && this.ctx !== null) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.memCanvas = document.createElement('canvas');
    this.memCanvas.width = this.canvas.width;
    this.memCanvas.height = this.canvas.height;
    this.memCtx = this.memCanvas.getContext('2d');
    this.lastImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).imageData;
    UndoCanvas.enableUndo(this.ctx);
    this.ctx.putTag(); // Initial history state

    window.addEventListener('mousemove', (e) => {
      // Watch mouse position
      if (e.target?.id === 'canvas') {
        this.canvasX = e.offsetX;
        this.canvasY = e.offsetY;
      }

      this.screenX = e.screenX;
      this.screenY = e.screenY;
    });

    keyboardJS.bind('ctrl + z', () => {
      this.ctx.undoTag();
    });

    keyboardJS.bind('ctrl + y', () => {
      this.ctx.redoTag();
    });

    keyboardJS.bind('ctrl + =', (e) => {
      const nextState = {...this.state, canvasZoom: this.state.canvasZoom + .25 };
      this.setState(nextState);
      e.preventDefault();
    });

    keyboardJS.bind('ctrl + -', (e) => {
      const nextState = {...this.state, canvasZoom: this.state.canvasZoom - .25 };
      this.setState(nextState);
      e.preventDefault();
    });

    keyboardJS.bind('ctrl + 0', (e) => {
      const nextState = {...this.state, canvasZoom: 1 };
      this.setState(nextState);
      e.preventDefault();
    });

    keyboardJS.bind(
      'space',
      (e) => {
        this.lastPosition = getAbsoluteMousePosition(e);
        this[`setup${this.props.tool}`](false);
        window.addEventListener('mousemove', this.handleCanvasDrag);
        e.preventRepeat();
        e.preventDefault();

        console.log('SPACE DOWN');
      },
      (e) => {
        window.removeEventListener('mousemove', this.handleCanvasDrag);
        this[`setup${this.props.tool}`](true);

        console.log('SPACE UP');
      }
    );

    keyboardJS.bind(
      'r', 
      (e) => {
        this[`setup${this.props.tool}`](false);
        window.addEventListener('mousemove', this.handleCanvasRotation);
        e.preventRepeat();
      },
      (e) => {
        window.removeEventListener('mousemove', this.handleCanvasRotation);
        this[`setup${this.props.tool}`](true);

        console.log('SPACE UP');
      }
    );

    keyboardJS.bind('esc', () => {
      this.setState({
        ...this.state,
        canvasZoom: 1,
        canvasTranslateX: 0,
        canvasTranslateY: 0,
        canvasRotation: 0,
      });
    });

    this[`setup${this.props.tool}`](true);
  }

  setupBrush(activate) {
    if(activate) {
      this.ctx.globalCompositeOperation = 'source-over';

      this.canvas.addEventListener('mousedown', this.startDraw);
      this.canvas.addEventListener('mouseup', this.endDraw);
    } else {
      this.canvas.removeEventListener('mousedown', this.startDraw);
      this.canvas.removeEventListener('mouseup', this.endDraw);
    }
  }

  setupEraser(activate) {
    if(activate) {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.canvas.addEventListener('mousedown', this.startDraw);
      this.canvas.addEventListener('mouseup', this.endDraw);
    } else {
      this.canvas.removeEventListener('mousedown', this.startDraw);
      this.canvas.removeEventListener('mouseup', this.endDraw);
    }
  }

  setupFill(activate) {
    if(activate) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.canvas.addEventListener('mousedown', this.fill);
    } else {
      this.canvas.removeEventListener('mousedown', this.fill);
    }
  }

  setupColorPicker(activate) {
    if(activate) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.canvas.addEventListener('mousedown', this.pickColor);
    } else {
      this.canvas.removeEventListener('mousedown', this.pickColor);
    }
  }

  componentDidUpdate(prevProps) {
    const { tool: prevTool } = prevProps;
    const { tool } = this.props;
  
    if (!this.canvas) return;
  
    this[`setup${prevTool}`](false);
    this[`setup${tool}`](true);
  }

  render() {
    const {
      canvasRotation,
      canvasTranslateX,
      canvasTranslateY,
      canvasZoom,
    } = this.state;
  
    const canvasStyle = {
      border: '1px solid #000000',
      transform: `translateX(${canvasTranslateX}px) translateY(${canvasTranslateY}px) rotate(${canvasRotation}deg) scale(${canvasZoom})`
    };

    return (
      <Box component="main" sx={{
        background: 'repeating-conic-gradient(#efefef 0% 25%, transparent 0% 50%) 50% / 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        cursor: 'crosshair',
        height: '100%'
      }}>
        <canvas
          id="canvas"
          ref={this.enableCanvas}
          width={800}
          height={600}
          style={canvasStyle}
        />
      </Box>
    );
  }
}

CompleteCanvas.defaultProps = {
  colors: {
    foreground: 'rgba(0,0,0,1)',
    background: 'rgba(255,255,255,1)'
  },
  brushSize: 6,
};

CompleteCanvas.propTypes = {
  tool: PropTypes.oneOf(['Brush', 'Eraser', 'Fill', 'ColorPicker']),
  colors: PropTypes.shape({
    foreground: PropTypes.string,
    background: PropTypes.string,
  }),
  brushSize: PropTypes.number,
  updateColor: PropTypes.func,
}