import { Routes, Route } from "react-router-dom";

import { Installer } from "./installer/installer";
import { Music } from "./music/music";
import { StableDiffusion } from "./stable_diffusion/stableDiffusion";
import { StableDiffusionXL } from "./stable_diffusion_xl/stableDiffusionXL";
import { Settings } from "./settings/settings";

export const Router = () => {
  return (
    <Routes>
      <Route element={<StableDiffusion />} path="/" />
      <Route element={<Music />} path="/music" />
      <Route element={<StableDiffusion />} path="/stablediffusion" />
      <Route element={<StableDiffusionXL />} path="/stablediffusionXL" />
      <Route element={<Installer />} path="/installation" />
      <Route element={<Settings />} path="/settings" />
      <Route element={<></>} path="/test6" />
    </Routes>
  );
};
