import { ipcRenderer as IPC, IpcRendererEvent as IPCEvent, contextBridge } from "electron";
import type { TInstallations } from "interfaces/installations";

const safeIPC = (eventName: string) => <T>(callback: (_: IPCEvent, value: T) => void) => {
  IPC.on(eventName, callback);
  return () => IPC.off(eventName, callback);
}

const api = {
  testInstallations: (): Promise<TInstallations> => IPC.invoke('testInstallations'),
  installPython: (): Promise<string> => IPC.invoke('installPython'),
  installPipenv: (): Promise<string> => IPC.invoke('installPipenv'),
  installServer: (): Promise<string> => IPC.invoke('installServer'),
}

//window.api = api;
contextBridge.exposeInMainWorld('api', api);

declare global {
  interface Window {
    api: typeof api;
  }
}

