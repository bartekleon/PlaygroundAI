import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

import { TInstallationState, TInstallations } from 'interfaces/installations';

const promisedExec = promisify(exec);
const commandAvailable = (command: string) => promisedExec(command)
  .then(() => TInstallationState.Installed)
  .catch(() => TInstallationState.NotInstalled);

const packagesInstalled = (command: string) => promisedExec(command)
  .then(({ stdout }) => stdout === 'success' ? TInstallationState.Installed : TInstallationState.NotInstalled)
  .catch(() => TInstallationState.NotInstalled);

const runCommand = (command: string) => promisedExec(command)
  .then(({ stderr }) => stderr ? `Error: ${stderr}` : "success")
  .catch(err => `Error: ${err}`);

export const installPython = () => {
  const installer_path = path.join(__dirname, './bin/python-3.10.0-amd64.exe');
  return runCommand(`${installer_path} /quiet PrependPath=1 Shortcuts=0 Include_doc=0 Include_test=0`);
}

export const installPipenv = () => {
  return runCommand('pip install pipenv');
}

export const installServer = () => {
  return runCommand('pipenv install python-socketio eventlet cryptography');
}

const REQUIREMENTS_PATH = (file: string) => `pipenv run python ./server/test_installations/${file}.py`;

export const checkServerRequirements = () => {
  return packagesInstalled(REQUIREMENTS_PATH('test_server'));
}

export const checkBasicRequirements = () => {
  return packagesInstalled(REQUIREMENTS_PATH('test_torch'));
}

export const checkMusicRequirements = () => {
  return packagesInstalled(REQUIREMENTS_PATH('test_audio'));
}

export const checkDiffusersRequirements = () => {
  return packagesInstalled(REQUIREMENTS_PATH('test_torch'));
}

export const determineInstallation = async (): Promise<TInstallations> => {
  const has_python = await commandAvailable("python --version");

  const has_pip = await commandAvailable("pip");

  const has_pipenv = await commandAvailable("pipenv");

  let has_server = TInstallationState.Unknown;
  let has_basic = TInstallationState.Unknown;
  let has_music = TInstallationState.Unknown;
  let has_diffusers = TInstallationState.Unknown;

  if (has_pip && has_pipenv) {
    has_server = await checkServerRequirements();
    has_basic = await checkBasicRequirements();
    has_music = await checkMusicRequirements();
    has_diffusers = await checkDiffusersRequirements();
  }

  return {
    has_python,
    has_pip,
    has_pipenv,
    has_server,
    has_basic,
    has_music,
    has_diffusers
  }
}
