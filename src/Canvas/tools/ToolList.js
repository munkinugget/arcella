import { useState } from 'react';
import { Pen } from './Pen';
import { Fill } from './Fill';
import { Eraser } from './Eraser';
import { List, ListItem } from '@mui/material';
import { atom, useRecoilState } from 'recoil';
import { ColorPicker } from './ColorPicker';
import { Palette } from './Palette';

const colorState = atom({
  key: 'colors',
  default: 'rgba(0,0,0,1)'
});

const tools = [
  {
    name: 'Pen',
    Component: Pen,
  },
  {
    name: 'Eraser',
    Component: Eraser,
  },
  {
    name: 'Fill',
    Component: Fill,
  },
  {
    name: 'Color Picker',
    Component: ColorPicker,
  }
];

export const ToolList = () => {
  const [currentTool, setCurrentTool] = useState(null);
  const [color, setColor] = useRecoilState(colorState);

  return (
    <List>
      {
        tools.map(({ Component, name }) => (
          <Component
            key={name}
            selected={name === currentTool}
            onClick={() => setCurrentTool(name)}
          />
        ))
      }
      <Palette />
    </List>
  );
}