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
    // outline(canvas, ctx, floodFill.imageData);
  }, [ctx, canvas]);

  const enable = () => {
    canvas.addEventListener('click', fill);
  }

  const disable = () => {
    canvas.removeEventListener('click', fill);
  }

  const outline = (canvas, ctx, img) => {
    var dArr = [-1,-1, 0,-1, 1,-1, -1,0, 1,0, -1,1, 0,1, 1,1], // offset array
      s = 2,  // thickness scale
      i = 0,  // iterator
      x = 5,  // final position
      y = 5;

    // draw images at offsets from the array scaled by s
    for(; i < dArr.length; i += 2)
      ctx.putImageData(img, x + dArr[i]*s, y + dArr[i+1]*s);

    // fill with color
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "blue";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // draw original image in normal mode
    ctx.globalCompositeOperation = "source-over";
    ctx.putImageData(img, x, y);
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
