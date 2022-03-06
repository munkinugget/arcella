import { Component } from 'react';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, colorState, contextState } from '../Canvas';
import { ListItem, ListItemIcon } from '@mui/material';
import { Colorize } from '@mui/icons-material';

export const ColorPicker = ({ selected, ...rest }) => {
  const [canvas] = useRecoilState(canvasState);
  const [ctx] = useRecoilState(contextState);
  const [colors, setColors] = useRecoilState(colorState);

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <Colorize/>
        <ColorPickerImperative
          selected={selected}
          canvas={canvas}
          ctx={ctx}
          setForeground={(rgba) => {
            setColors({
              foreground: rgba,
              background: colors.background
            });
          }}
        />
      </ListItemIcon>
    </ListItem>
  );
}

class ColorPickerImperative extends Component {
  constructor(props) {
    super(props);

    this.getColor = this.getColor.bind(this);
  }

  componentDidUpdate() {
    if (this.props.selected && this.props.canvas) {
      this.enable();
    } else {
      this.disable();
    }
  }

  getColor(e) {
    const { x, y } = getRelativeMousePosition(e);
    const [r, g, b, a] = this.props.ctx.getImageData(x,y, 1, 1).data;
    this.props.setForeground(`rgba(${r},${g},${b},${a})`);
  }

  enable() {
    console.log('ENABLE COLORPICKER');
    this.props.canvas.addEventListener('click', this.getColor);
  }

  disable() {
    console.log('DISABLE COLORPICKER');
    this.props.canvas.removeEventListener('click', this.getColor);
  }

  render() {
    return null;
  }
}
