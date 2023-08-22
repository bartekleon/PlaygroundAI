import { existsSync } from "fs";
import { basename, relative } from "path";

import { glob } from "glob";
import type { FilePathType } from "interfaces/getFiles";

export const getFiles = async (folder_path: string, exts: string[]): Promise<FilePathType[]> => {
  if (!existsSync(folder_path)) {
    return [];
  }

  const results = await glob(`**/*.{${exts.join(",")}}`, {
    absolute: true, windowsPathsNoEscape: true, cwd: folder_path });

  return results.map((full_path) => {
    return {
      full_path,
      relative_path: relative(folder_path, full_path),
      basename: basename(full_path)
    };
  });
};
