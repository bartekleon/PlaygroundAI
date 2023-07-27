import { spawn, ChildProcessWithoutNullStreams, execSync } from 'child_process';

let server: ChildProcessWithoutNullStreams | null = null;

export const startServer = () => {
  server = spawn('pipenv run python ./server/server.py', { detached: true, shell: true });

  server.stdout.on('data', data => {
    console.log(`Got some data : ${data}`)
  });
    
  server.stderr.on('data', data => {
    console.log(`Got some error : ${data}`)
  });

  server.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

export const restartServer = () => {
  closeServer();
  startServer();
}

export const closeServer = () => {
  if (server?.pid) execSync(`taskkill /pid ${server.pid} /T /F`);
}
