import { useCallback, useEffect, useState } from "react";
import type { ButtonProps } from "@mui/material";
import { Box, Button, CircularProgress } from "@mui/material";

import type { InstallationsType } from "interfaces/installations";
import { InstallationState } from "interfaces/installations";

const InstallationButtonColor = (value: InstallationState): ButtonProps["color"] => {
  switch (value) {
    case InstallationState.INSTALLED:
      return "success";
    case InstallationState.INSTALLING:
      return "warning";
    case InstallationState.NOT_INSTALLED:
      return "error";
    case InstallationState.UNKNOWN:
      return "secondary";
  }
};

interface InstallationProgressType {
  name: string;
  value: InstallationState;
  onClick?: () => void;
}

const InstallationProgress = ({ name, value, onClick }: InstallationProgressType) => {
  return (
    <Box>
      { value === InstallationState.INSTALLING ? <CircularProgress /> : null }
      <Button
        onClick={onClick}
        variant='contained'
        color={InstallationButtonColor(value)}
      >
        {name} {value}
      </Button>
    </Box>
  );
};

export const Installer = () => {
  const [installations, setInstallations] = useState<InstallationsType>({
    has_python: InstallationState.UNKNOWN,
    has_pip: InstallationState.UNKNOWN,
    has_pipenv: InstallationState.UNKNOWN,
    has_server: InstallationState.UNKNOWN,
    has_basic: InstallationState.UNKNOWN,
    has_music: InstallationState.UNKNOWN,
    has_diffusers: InstallationState.UNKNOWN
  });
    
  useEffect(() => {
    window.api.testInstallations().then(setInstallations);
  }, []);

  const installPython = useCallback(async () => {
    if (installations.has_python === InstallationState.INSTALLED) return;

    setInstallations({ ...installations, has_python: InstallationState.INSTALLING });
    const response = await window.api.installPython();
    if (response === "success") {
      setInstallations({ ...installations, has_python: InstallationState.INSTALLED });
    } else {
      setInstallations({ ...installations, has_python: InstallationState.NOT_INSTALLED });
    }
  }, [installations]);

  return <div>
    <InstallationProgress name='has python' value={installations.has_python} onClick={installPython}/>
    <InstallationProgress name='has pip' value={installations.has_pip}/>
    <InstallationProgress name='has pipenv' value={installations.has_pipenv}/>
    <InstallationProgress name='has server' value={installations.has_server}/>
    <InstallationProgress name='has basic' value={installations.has_basic}/>
    <InstallationProgress name='has music' value={installations.has_music}/>
    <InstallationProgress name='has diffusers' value={installations.has_diffusers}/>
  </div>;
};
