import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn, execSync } from "child_process";

let server: ChildProcessWithoutNullStreams | null = null;

export const startServer = () => {
  server = spawn("pipenv run python ./server.py", { detached: true, shell: true });

  server.stdout.on("data", data => {
    console.log(`Got some data : ${String(data)}`);
  });
    
  server.stderr.on("data", data => {
    console.log(`Got some error : ${String(data)}`);
  });

  server.on("close", (code) => {
    console.log(`child process exited with code ${String(code)}`);
  });
};

export const closeServer = () => {
  if (server?.pid) execSync(`taskkill /pid ${server.pid} /T /F`);
};

export const restartServer = () => {
  closeServer();
  startServer();
};
