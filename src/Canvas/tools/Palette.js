import { useEffect, useCallback, useState } from 'react';
import { colorToRgbaString, getRelativeMousePosition, rgbaStringToColor } from './utils';
import { useRecoilState } from 'recoil';
import { colorState } from '../Canvas';
import { ListItem, ListItemIcon } from '@mui/material';
import { Square } from '@mui/icons-material';
import { SketchPicker } from 'react-color';

export const Palette = () => {
  const [{foreground, background}, setColors] = useRecoilState(colorState);
  const [open, setOpen] = useState(false);

  const handleColorChange = (color) => {
    setColors({ foreground: colorToRgbaString(color), background });
  }

  return (
    <ListItem button onClick={() => setOpen(true)}>
      <ListItemIcon sx={{ minWidth: 0 }}>
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid black',
          backgroundColor: foreground
        }} />
        {
          open ? 
          <SketchPicker
            color={rgbaStringToColor(foreground)}
            onChange={handleColorChange}
          /> : null
        }
      </ListItemIcon>
    </ListItem>
  );
}
