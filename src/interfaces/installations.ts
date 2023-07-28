export enum TInstallationState {
  Unknown,
  NotInstalled,
  Installing,
  Installed
}

export interface TInstallations {
  has_python: TInstallationState;
  has_pip: TInstallationState;
  has_pipenv: TInstallationState;
  has_server: TInstallationState;
  has_basic: TInstallationState;
  has_music: TInstallationState;
  has_diffusers: TInstallationState;
}
