import { app, BrowserWindow } from "electron";
import { createIPC } from "./IPC/ipc";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createWindow = () => {
  const main_window = new BrowserWindow({
    width: 1350,
    height: 1000,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  });

  main_window.removeMenu();
  main_window.setTitle("PlaygroundAI v" + app.getVersion());

  createIPC(main_window);

  main_window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  main_window.webContents.openDevTools();
};
