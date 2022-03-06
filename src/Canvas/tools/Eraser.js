import { Component } from 'react';
import { Clear } from '@mui/icons-material';
import { ListItem, ListItemIcon } from '@mui/material';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, contextState } from '../Canvas';

export const Eraser = ({ selected, ...rest }) => {
  const [canvas] = useRecoilState(canvasState);
  const [ctx] = useRecoilState(contextState);

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <Clear/>
        <EraserImperative
          selected={selected}
          canvas={canvas}
          ctx={ctx}
        />
      </ListItemIcon>
    </ListItem>
  );
};

class EraserImperative extends Component {
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
      this.props.ctx.globalCompositeOperation="destination-out";
      this.props.ctx.lineCap = 'round';
      this.props.ctx.strokeStyle = 'rgba(0,0,0,1)';
      this.props.ctx.lineWidth = 3 * 2;
      this.props.canvas.addEventListener('mousemove', this.draw);
    }
  }

  end(e) {
    this.props.canvas.removeEventListener('mousemove', this.draw);
    this.props.ctx.putTag();
  }

  enable() {
    if (!this.props.canvas) return;
    this.props.canvas.addEventListener('mousedown', this.start);
    this.props.canvas.addEventListener('mouseup', this.end);
  }

  disable() {
    if (!this.props.canvas) return;
    this.props.canvas.removeEventListener('mousemove', this.draw);
    this.props.canvas.removeEventListener('mousedown', this.start);
    this.props.canvas.removeEventListener('mouseup', this.end);
  }

  render() {
    return null;
  }
}
