import type { BrowserWindow } from "electron";
import { ipcMain, shell } from "electron";

import path from "path";

import { determineInstallation, installPipenv, installPython, installServer } from "../dependencies/test_python";
import { FileWatcher } from "../helpers/filesWatcher";
import { getFiles } from "../helpers/getFiles";
import { MODELS_EXTENSIONS } from "../helpers/extensions";
import { electronDialog } from "../helpers/electronDialog";

export const createIPC = (main_window: BrowserWindow) => {
  ipcMain.handle("testInstallations", async () => determineInstallation());
  ipcMain.handle("installPython", async () => installPython());
  ipcMain.handle("installPipenv", async () => installPipenv()); 
  ipcMain.handle("installServer", async () => installServer());
  ipcMain.handle("choosePath", async () => {
    const dirs = await electronDialog("Directory");
    return dirs.length ? dirs[0] : "";
  });

  ipcMain.handle("showInExplorer", (_, data: string) => {
    shell.openPath(path.resolve(data));
  });

  const getCheckpoints = async (folder: string) => {
    return getFiles(folder, MODELS_EXTENSIONS);
  };

  const modelsWatcherCallback = (folder: string) => async () => {
    main_window.webContents.send("modelsChange", await getCheckpoints(folder));
  }; 
  const lorasWatcherCallback = (folder: string) => async () => {
    main_window.webContents.send("lorasChange", await getCheckpoints(folder));
  };
  const vaesWatcherCallback = (folder: string) => async () => {
    main_window.webContents.send("vaesChange", await getCheckpoints(folder));
  };

  const models_watcher = new FileWatcher(modelsWatcherCallback);
  const loras_watcher = new FileWatcher(lorasWatcherCallback);
  const vaes_watcher = new FileWatcher(vaesWatcherCallback);

  ipcMain.handle("modelsFolder", (_, folder_path: string) => {
    models_watcher.reassignWatcher(folder_path);
  });

  ipcMain.handle("lorasFolder", (_, folder_path: string) => {
    loras_watcher.reassignWatcher(folder_path);
  });

  ipcMain.handle("vaesFolder", (_, folder_path: string) => {
    vaes_watcher.reassignWatcher(folder_path);
  });
};
