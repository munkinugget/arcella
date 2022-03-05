import { useEffect, useCallback } from 'react';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, contextState } from '../Canvas';
import { ListItem, ListItemIcon } from '@mui/material';
import { Colorize } from '@mui/icons-material';

export const ColorPicker = ({ selected, ...rest }) => {
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
    const { x, y } = getRelativeMousePosition(e);
    const [r, g, b, a] = ctx.getImageData(x,y, 1, 1).data;
    console.log(`rgba(${r},${g},${b},${a})`);
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
        <Colorize/>
      </ListItemIcon>
    </ListItem>
  );
}
