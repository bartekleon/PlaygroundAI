import { app } from "electron";
import type { FSWatcher } from "fs";
import fs from "fs";

type FileWatcherCallbackType = (event: string, filename: string | null) => void;

export class FileWatcher {
  public current_folder_path = "";

  private _watcher: FSWatcher | null = null;

  private readonly _callback: (folder_path: string) => FileWatcherCallbackType;

  public constructor (callback: (folder_path: string) => FileWatcherCallbackType) {
    this._callback = callback;
  }

  public reassignWatcher = (folder_path: string) => {
    if (!fs.existsSync(folder_path)) {
      folder_path = app.getPath("home");
    }

    this._callback(folder_path)("", null);
    if (this.current_folder_path === folder_path) return;

    this.current_folder_path = folder_path;
    this._watcher?.close();
    this._watcher = fs.watch(folder_path, this._callback(this.current_folder_path));
  };
}
