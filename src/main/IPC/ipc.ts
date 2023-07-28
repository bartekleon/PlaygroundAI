import { BrowserWindow, ipcMain } from 'electron';

import { determineInstallation, installPipenv, installPython, installServer } from '../dependencies/test_python';

export const createIPC = (mainWindow: BrowserWindow) => {
  ipcMain.handle('testInstallations', async () => await determineInstallation());
  ipcMain.handle('installPython', async () => await installPython());
  ipcMain.handle('installPipenv', async () => await installPipenv()); 
  ipcMain.handle('installServer', async () => await installServer());
}
