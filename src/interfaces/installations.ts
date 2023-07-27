export enum TInstallationState {
  Unknown,
  NotInstalled,
  Installing,
  Installed
}

export interface TInstallations {
  has_pip: TInstallationState
  has_pipenv: TInstallationState
}
