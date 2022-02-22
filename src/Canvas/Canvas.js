import { Pen } from './tools/Pen';
import { Fill } from './tools/Fill';

const tools = [
  {
    name: 'Pen',
    tool: new Pen(),
  },{
    name: 'Fill',
    tool: new Fill(),
  }
];

export const Canvas = () => {
  return (
    <div>
      <Layer active zIndex={0} />
    </div>
  );
};