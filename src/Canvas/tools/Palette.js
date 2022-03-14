import { colorToRgbaString, rgbaStringToColor } from './utils';
import { useRecoilState } from 'recoil';
import { colorState } from '../Canvas';
import { SketchPicker } from 'react-color';

export const Palette = () => {
  const [{foreground, background}, setColors] = useRecoilState(colorState);

  const handleColorChange = (color) => {
    setColors({ foreground: colorToRgbaString(color), background });
  }

  return (
    <SketchPicker
      color={rgbaStringToColor(foreground)}
      onChange={handleColorChange}
    />
  );
}
