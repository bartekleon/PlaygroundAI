import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";

import { determineInstallation, installPipenv, installPython, installServer } from "../dependencies/test_python";

export const createIPC = (main_window: BrowserWindow) => {
  ipcMain.handle("testInstallations", async () => determineInstallation());
  ipcMain.handle("installPython", async () => installPython());
  ipcMain.handle("installPipenv", async () => installPipenv()); 
  ipcMain.handle("installServer", async () => installServer());
};
