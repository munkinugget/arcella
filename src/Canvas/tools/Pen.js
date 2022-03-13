import { Component } from 'react';
import { Brush } from '@mui/icons-material';
import { ListItem, ListItemIcon } from '@mui/material';
import { getRelativeMousePosition } from './utils';
import { useRecoilValue } from 'recoil';
import { canvasState, colorState, contextState } from '../Canvas';
import keyboardJS from 'keyboardjs';

export const Pen = ({ selected, ...rest }) => {
  const canvas = useRecoilValue(canvasState);
  const ctx = useRecoilValue(contextState);
  const colors = useRecoilValue(colorState);

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <Brush/>
        <PenImperative
          selected={selected}
          canvas={canvas}
          ctx={ctx}
          colors={colors}
        />
      </ListItemIcon>
    </ListItem>
  );
};

class PenImperative extends Component {
  constructor(props) {
    super(props);
    this.previous = { x: 0, y: 0 };

    this.draw = this.draw.bind(this);
    this.start = this.start.bind(this);
    this.end = this.end.bind(this);
  }

  componentDidUpdate() {
    if (this.props.selected && this.props.canvas) {
      this.enable();
    } else {
      this.disable();
    }
  }

  componentWillUnmount() {
    this.disable();
  }

  draw(e) {
    if (!this.props.ctx) return;
    const position = getRelativeMousePosition(e);
    const x1 = this.previous.x;
    const x2 = position.x;
    const y1 = this.previous.y;
    const y2 = position.y;
    
    if (Math.hypot(x2-x1, y2-y1) < 3) return; 
    
    this.props.ctx.beginPath();
    this.props.ctx.moveTo(x1, y1);
    this.props.ctx.lineTo(x2, y2);
    this.props.ctx.stroke();
    this.props.ctx.closePath();
    
    this.previous = { x: x2, y: y2 };
  }
  
  start(e) {
    if (e.buttons === 1 && this.props.canvas) {
      this.previous = getRelativeMousePosition(e);
      this.props.ctx.globalCompositeOperation="source-over";
      this.props.ctx.lineCap = 'round';
      this.props.ctx.strokeStyle = this.props.colors.foreground;
      this.props.ctx.lineWidth = 3 * 2;
      this.props.canvas.addEventListener('mousemove', this.draw);
    }
  }

  end(e) {
    this.props.canvas.removeEventListener('mousemove', this.draw);
    this.props.ctx.putTag();
  }

  enable() {
    console.log('ENABLE PEN');
    if (!this.props.canvas) return;
    this.props.canvas.addEventListener('mousedown', this.start);
    this.props.canvas.addEventListener('mouseup', this.end);
  }

  disable() {
    console.log('DISABLE PEN');
    if (!this.props.canvas) return;
    this.props.canvas.removeEventListener('mousemove', this.draw);
    this.props.canvas.removeEventListener('mousedown', this.start);
    this.props.canvas.removeEventListener('mouseup', this.end);
  }

  render() {
    return null;
  }
}
