import { useState, useEffect } from 'react';
import { Box, Drawer } from '@mui/material';
import UndoCanvas from 'undo-canvas';
import keyboardJS from 'keyboardjs';
import { ToolList } from './tools/ToolList';
import { atom, useRecoilState } from 'recoil';

export const canvasState = atom({ key: 'canvas', default: null, dangerouslyAllowMutability: true });
export const contextState = atom({ key: 'context', default: null, dangerouslyAllowMutability: true });

export const Canvas = () => {
  // Cant use recoil here, it sets the object to immutable, and values change on render, need to prop drill
  const [canvas, setCanvas] = useRecoilState(canvasState);
  const [, setContext] = useRecoilState(contextState);

  const enableCanvas = (canvas) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    UndoCanvas.enableUndo(ctx);
    ctx.putTag(); // Initial history state

    keyboardJS.bind('ctrl + z', () => {
      ctx.undoTag();
    });
    keyboardJS.bind('ctrl + y', () => {
      ctx.redoTag();
    });

    setCanvas(canvas);
    setContext(ctx);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" open>
        { canvas ? <ToolList /> : null }
      </Drawer>
      <Box component="main" sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1
      }}>
        <canvas
          ref={enableCanvas}
          width={800}
          height={600}
          style={{ border: '1px solid #000000' }}
        />
      </Box>
    </Box>
  );
};