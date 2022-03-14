import { useRecoilState } from 'recoil';
import { Slider } from '@mui/material';
import { brushState } from '../Canvas';

export const BrushSize = () => {
  const [brush, setBrush] = useRecoilState(brushState);

  return (
    <div style={{
      paddingTop: '2.5rem',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    }}>
      <Slider
        defaultValue={brush.size}
        aria-label="Brush Size"
        valueLabelDisplay="auto"
        value={brush.size}
        onChange={(event, size) => setBrush({ ...brush, size })}
      />
    </div>

  )
}