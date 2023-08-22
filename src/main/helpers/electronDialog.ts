import type { OpenDialogOptions } from "electron";
import { dialog } from "electron";
import os from "os";

type ModeType = "Directory" | "File" | "Files";

export const getOpenDialogProps = (mode: ModeType): OpenDialogOptions["properties"] => {
  switch (mode) {
    case "Directory":
      return ["openDirectory"];
    case "File":
      return ["openFile"];
    case "Files":
      if (!(os.platform() === "linux" || os.platform() === "win32")) {
        return ["openDirectory", "openFile", "multiSelections"];
      }
      return ["openFile", "multiSelections"];
  }
};

export const electronDialog = async (mode: ModeType, extensions?: string[]) => {
  const filters = extensions ? [
    { name: "Files", extensions }
  ] : undefined;

  const results = await dialog.showOpenDialog({
    properties: getOpenDialogProps(mode),
    filters
  });

  return results.filePaths;
};
