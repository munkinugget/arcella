import { useEffect, useCallback } from 'react';
import FloodFill from 'q-floodfill';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, contextState } from '../Canvas';
import { List, ListItem, ListItemIcon } from '@mui/material';
import { FormatColorFill } from '@mui/icons-material';

export const Fill = ({ selected, ...rest }) => {
  const [canvas] = useRecoilState(canvasState);
  const [ctx] = useRecoilState(contextState);

  useEffect(() => {
    if(selected) {
      enable();
    } else {
      disable();
    }
  }, [selected]);

  const fill = useCallback((e) => {
    const img = ctx.getImageData(0,0, canvas.width, canvas.height);
    const floodFill = new FloodFill(img);
    const { x, y } = getRelativeMousePosition(e);
    floodFill.fill('#000000', x, y);
    ctx.putImageData(floodFill.imageData, 0, 0);
  }, [ctx, canvas]);

  const enable = () => {
    canvas.addEventListener('click', fill);
  }

  const disable = () => {
    canvas.removeEventListener('click', fill);
  }

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <FormatColorFill/>
      </ListItemIcon>
    </ListItem>
  );
}
