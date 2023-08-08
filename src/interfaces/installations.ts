export enum InstallationState {
  UNKNOWN = 0,
  NOT_INSTALLED = 1,
  INSTALLING = 2,
  INSTALLED = 3
}

export interface InstallationsType {
  has_python: InstallationState;
  has_pip: InstallationState;
  has_pipenv: InstallationState;
  has_server: InstallationState;
  has_basic: InstallationState;
  has_music: InstallationState;
  has_diffusers: InstallationState;
}
