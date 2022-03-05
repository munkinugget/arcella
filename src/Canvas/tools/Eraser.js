import { useRef, useEffect, useCallback } from 'react';
import { Clear } from '@mui/icons-material';
import { ListItem, ListItemIcon } from '@mui/material';
import { getRelativeMousePosition } from './utils';
import { useRecoilState } from 'recoil';
import { canvasState, contextState } from '../Canvas';

export const Eraser = ({ selected, ...rest }) => {
  const [canvas] = useRecoilState(canvasState);
  const [ctx] = useRecoilState(contextState);
  const previous = useRef({ x: 0, y: 0 });

  const draw = useCallback((e) => {
    if (!ctx) return;
    const position = getRelativeMousePosition(e);
    const x1 = previous.current.x;
    const x2 = position.x;
    const y1 = previous.current.y;
    const y2 = position.y;
    
    if (Math.hypot(x2-x1, y2-y1) < 3) return; 
    
    ctx.globalCompositeOperation="destination-out";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    // this.ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = 3 * 2;
    // const mid = midPoint(position, currentPosition);
    // ctx.quadraticCurveTo(position.x, position.y, mid.x, mid.y);
    ctx.stroke();
    ctx.closePath();
    
    previous.current = { x: x2, y: y2 };
  }, [ctx]);

  const start = useCallback((e) => {
    if (e.buttons === 1 && canvas) {
      previous.current = getRelativeMousePosition(e);
      canvas.addEventListener('mousemove', draw);
    }
  }, [canvas]);

  const end = useCallback((e) => {
    canvas.removeEventListener('mousemove', draw);
    ctx.putTag();
  }, [ctx]);

  const enable = () => {
    if (!canvas) return;
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mouseup', end);
  };

  const disable = () => {
    if (!canvas) return;
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mousedown', start);
    canvas.removeEventListener('mouseup', end);
  };

  useEffect(() => {
    if(selected) {
      enable();
    } else {
      disable();
    }
  }, [selected]);

  return (
    <ListItem
      button
      selected={selected}
      { ...rest }
    >
      <ListItemIcon sx={{ minWidth: 0 }}>
        <Clear/>
      </ListItemIcon>
    </ListItem>
  );
};
