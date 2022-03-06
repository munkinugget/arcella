import { Component } from 'react';
import FloodFill from 'q-floodfill';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, colorState, contextState } from '../Canvas';
import { ListItem, ListItemIcon } from '@mui/material';
import { FormatColorFill } from '@mui/icons-material';

export const Fill = ({ selected, ...rest }) => {
  const [canvas] = useRecoilState(canvasState);
  const [ctx] = useRecoilState(contextState);
  const [colors] = useRecoilState(colorState);

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <FormatColorFill/>
        <FillImperative
          selected={selected}
          canvas={canvas}
          ctx={ctx}
          colors={colors}
        />
      </ListItemIcon>
    </ListItem>
  );
}

class FillImperative extends Component {
  constructor(props) {
    super(props);

    this.fill = this.fill.bind(this);
  }

  componentDidUpdate() {
    if (this.props.selected && this.props.canvas) {
      this.enable();
    } else {
      this.disable();
    }
  }

  fill(e) {
    const img = this.props.ctx.getImageData(0,0, this.props.canvas.width, this.props.canvas.height);
    const floodFill = new FloodFill(img);
    const { x, y } = getRelativeMousePosition(e);
    floodFill.fill(this.props.colors.foreground, x, y);
    this.props.ctx.putImageData(floodFill.imageData, 0, 0);
    this.props.ctx.putTag();
    // outline(canvas, ctx, floodFill.imageData);
  }

  enable() {
    console.log('ENABLE FILL');
    this.props.canvas.addEventListener('click', this.fill);
  }

  disable() {
    console.log('DISABLE FILL');
    this.props.canvas.removeEventListener('click', this.fill);
  }

  outline(canvas, ctx, img) {
    var dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
      s = 2,  // thickness scale
      i = 0,  // iterator
      x = 5,  // final position
      y = 5;

    // draw images at offsets from the array scaled by s
    for(; i < dArr.length; i += 2)
      this.props.ctx.putImageData(img, x + dArr[i]*s, y + dArr[i+1]*s);

    // fill with color
    this.props.ctx.globalCompositeOperation = "source-in";
    this.props.ctx.fillStyle = "blue";
    this.props.ctx.fillRect(0,0,this.props.canvas.width, this.props.canvas.height);

    // draw original image in normal mode
    this.props.ctx.globalCompositeOperation = "source-over";
    this.props.ctx.putImageData(img, x, y);
  }

  render() {
    return null;
  }
}
