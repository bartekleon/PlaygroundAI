import { app, BrowserWindow } from 'electron';
import { createIPC } from './IPC/ipc';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1350,
    height: 1000,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.removeMenu()
  mainWindow.setTitle("PlaygroundAI v" + app.getVersion());

  createIPC(mainWindow);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.openDevTools();
};
