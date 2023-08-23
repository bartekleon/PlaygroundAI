import type { IpcRendererEvent as IPCEvent } from "electron";
import { ipcRenderer as IPC, contextBridge } from "electron";
import type { InstallationsType } from "interfaces/installations";
import type { FilePathType } from "interfaces/getFiles";

const safeIPC = <Type>(event_name: string) => (callback: (_: IPCEvent, value: Type) => void) => {
  IPC.on(event_name, callback);
  return () => IPC.off(event_name, callback);
};

const api = {
  testInstallations: async () => IPC.invoke("testInstallations") as Promise<InstallationsType>,
  installPython: async () => IPC.invoke("installPython") as Promise<string>,
  installPipenv: async () => IPC.invoke("installPipenv") as Promise<string>,
  installServer: async () => IPC.invoke("installServer") as Promise<string>,

  modelsFolder: async (folder_path: string) => IPC.invoke("modelsFolder", folder_path) as Promise<void>,
  modelsChange: safeIPC<FilePathType[]>("modelsChange"),

  lorasFolder: async (folder_path: string) => IPC.invoke("lorasFolder", folder_path) as Promise<void>,
  lorasChange: safeIPC<FilePathType[]>("lorasChange"),

  vaesFolder: async (folder_path: string) => IPC.invoke("vaesFolder", folder_path) as Promise<void>,
  vaesChange: safeIPC<FilePathType[]>("vaesChange"),

  choosePath: async () => IPC.invoke("choosePath") as Promise<string>,

  showInExplorer: async (path: string) => IPC.invoke("showInExplorer", path) as Promise<void>
};

//window.api = api;
contextBridge.exposeInMainWorld("api", api);

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Window {
    api: typeof api;
  }
}

