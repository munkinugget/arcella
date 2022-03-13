import { Component } from 'react';
import PropTypes from 'prop-types';
import { getRelativeMousePosition, getAbsoluteMousePosition, getRelativeMouseMovement } from './tools/utils';
import keyboardJS from 'keyboardjs';
import UndoCanvas from 'undo-canvas';
import FloodFill from 'q-floodfill';
import { Box } from '@mui/material';

export default class CompleteCanvas extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.ctx = null;
    this.lastPosition = { x: 0, y: 0 };

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
  }

  /*
  TODO
  
  Pan - hold space + click and drag to pan the canvas
  Zoom - ctrl + + / ctrl + - to zoom in and out
  Rotate - ?
  */

  startDraw(e) {
    this.lastPosition = getRelativeMousePosition(e);
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.props.colors.foreground;
    this.ctx.lineWidth = this.props.brushSize;
    this.canvas.addEventListener('mousemove', this.draw);
  }

  endDraw(e) {
    this.canvas.removeEventListener('mousemove', this.draw);
    this.ctx.putTag();
  }

  draw(e) {
    const position = getRelativeMousePosition(e);
    const x1 = this.lastPosition.x;
    const x2 = position.x;
    const y1 = this.lastPosition.y;
    const y2 = position.y;
    
    if (Math.hypot(x2-x1, y2-y1) < 3) return; 
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.closePath();
    
    this.lastPosition = { x: x2, y: y2 };
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
    console.log(`rgba(${r},${g},${b},${a})`);
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

  enableCanvas(canvas) {
    if (this.canvas !== null && this.ctx !== null) return;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    UndoCanvas.enableUndo(this.ctx);
    this.ctx.putTag(); // Initial history state

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

    console.log(canvasStyle)

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
}