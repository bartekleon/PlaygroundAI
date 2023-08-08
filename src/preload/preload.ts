import type { IpcRendererEvent as IPCEvent } from "electron";
import { ipcRenderer as IPC, contextBridge } from "electron";
import type { InstallationsType } from "interfaces/installations";

const safeIPC = (event_name: string) => <Type>(callback: (_: IPCEvent, value: Type) => void) => {
  IPC.on(event_name, callback);
  return () => IPC.off(event_name, callback);
};

const api = {
  testInstallations: async () => IPC.invoke("testInstallations") as Promise<InstallationsType>,
  installPython: async () => IPC.invoke("installPython") as Promise<string>,
  installPipenv: async () => IPC.invoke("installPipenv") as Promise<string>,
  installServer: async () => IPC.invoke("installServer") as Promise<string>
};

//window.api = api;
contextBridge.exposeInMainWorld("api", api);

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    api: typeof api;
  }
}

