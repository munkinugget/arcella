import { RecoilRoot } from "recoil";
import { Canvas } from "./Canvas/Canvas";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <RecoilRoot>
      <CssBaseline/>
      <Canvas/>
    </RecoilRoot>
  );
}

export default App;
