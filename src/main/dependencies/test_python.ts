import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

import type { InstallationsType } from "interfaces/installations";
import { InstallationState } from "interfaces/installations";

const promisedExec = promisify(exec);
const commandAvailable = async (command: string) => promisedExec(command)
  .then(() => InstallationState.INSTALLED)
  .catch(() => InstallationState.NOT_INSTALLED);

const packagesInstalled = async (command: string) => promisedExec(command)
  .then(({ stdout }) => {
    return stdout.includes("success") ? InstallationState.INSTALLED : InstallationState.NOT_INSTALLED;
  })
  .catch(() => InstallationState.NOT_INSTALLED);

const runCommand = async (command: string) => promisedExec(command)
  .then(({ stderr }) => stderr ? `Error: ${stderr}` : "success")
  .catch(err => `Error: ${String(err)}`);

export const installPython = async () => {
  const installer_path = path.join(__dirname, "./bin/python-3.10.0-amd64.exe");
  return runCommand(`${installer_path} /quiet PrependPath=1 Shortcuts=0 Include_doc=0 Include_test=0`);
};

export const installPipenv = async () => {
  return runCommand("pip install pipenv");
};

export const installServer = async () => {
  return runCommand("pipenv install python-socketio eventlet cryptography");
};

const formatFilePath = (file: string) => `pipenv run python ./server/test_installations/${file}.py`;

export async function checkServerRequirements () {
  return packagesInstalled(formatFilePath("test_server"));
}

export async function checkBasicRequirements () {
  return packagesInstalled(formatFilePath("test_torch"));
}

export async function checkMusicRequirements () {
  return packagesInstalled(formatFilePath("test_audio"));
}

export async function checkDiffusersRequirements () {
  return packagesInstalled(formatFilePath("test_torch"));
}

export const determineInstallation = async (): Promise<InstallationsType> => {
  const has_python = await commandAvailable("python --version");

  const has_pip = await commandAvailable("pip");

  const has_pipenv = await commandAvailable("pipenv");

  let has_server = InstallationState.UNKNOWN;
  let has_basic = InstallationState.UNKNOWN;
  let has_music = InstallationState.UNKNOWN;
  let has_diffusers = InstallationState.UNKNOWN;

  if (has_pip && has_pipenv) {
    [has_server, has_basic, has_music, has_diffusers] = await Promise.all([
      checkServerRequirements(),
      checkBasicRequirements(),
      checkMusicRequirements(),
      checkDiffusersRequirements()
    ]);
  }

  return {
    has_python,
    has_pip,
    has_pipenv,
    has_server,
    has_basic,
    has_music,
    has_diffusers
  };
};
