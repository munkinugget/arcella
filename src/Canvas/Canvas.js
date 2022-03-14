import { Box, Drawer, List, ListItem, ListItemIcon } from '@mui/material';
import { Brush, Clear, Colorize, FormatColorFill } from '@mui/icons-material';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import CompleteCanvas from './CompleteCanvas';
import { Palette } from './tools/Palette';
import { BrushSize } from './tools/BrushSize';

export const canvasState = atom({ key: 'canvas', default: null, dangerouslyAllowMutability: true });
export const contextState = atom({ key: 'context', default: null, dangerouslyAllowMutability: true });
export const colorState = atom({
  key: 'colors',
  default: {
    foreground: 'rgba(0,0,0,1)',
    background: 'rgba(255,255,255,1)'
  }
});
export const brushState = atom({
  key: 'brush',
  default: {
    style: 'round',
    size: 6,
  },
});
export const eraserState = atom({
  key: 'eraser',
  default: {
    style: 'round',
    size: 6,
  },
});

export const toolState = atom({ key: 'tool', default: 'Brush' });

export const Canvas = () => {
  const [tool, setTool] = useRecoilState(toolState);
  const colors = useRecoilValue(colorState);
  const brush = useRecoilValue(brushState);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Drawer variant="permanent" open>
        <List>
          <ListItem button onClick={() => setTool('Brush')}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Brush/>
            </ListItemIcon>
          </ListItem>
          <ListItem button onClick={() => setTool('Eraser')}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Clear/>
            </ListItemIcon>
          </ListItem>
          <ListItem button onClick={() => setTool('ColorPicker')}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Colorize/>
            </ListItemIcon>
          </ListItem>
          <ListItem button onClick={() => setTool('Fill')}>
            <ListItemIcon sx={{ minWidth: 0 }}>
              <FormatColorFill/>
            </ListItemIcon>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        cursor: 'crosshair'
      }}>
        <CompleteCanvas
          tool={tool}
          colors={colors}
          brush={brush}
        />
      </Box>
      <Box sx={{ borderLeft: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <BrushSize />
        <Palette />
      </Box>
    </Box>
  );
};