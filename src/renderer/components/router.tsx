import { Routes, Route } from "react-router-dom";

import { Installer } from "./installer/installer";
import { Music } from "./music/music";
import { StableDiffusion } from "./stable_diffusion/stableDiffusion";

export const Router = () => {
  return (
    <Routes>
      <Route element={<StableDiffusion />} path="/" />
      <Route element={<Music />} path="/music" />
      <Route element={<StableDiffusion />} path="/stablediffusion" />
      <Route element={<Installer />} path="/installation" />
      <Route element={<></>} path="/test4" />
      <Route element={<></>} path="/test5" />
      <Route element={<></>} path="/test6" />
    </Routes>
  );
}
