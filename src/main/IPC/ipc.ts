import { BrowserWindow, ipcMain } from 'electron';

import { determineInstallation } from '../dependencies/test_python';

export const createIPC = (mainWindow: BrowserWindow) => {
  ipcMain.handle('testInstallations', async () => await determineInstallation());
}

