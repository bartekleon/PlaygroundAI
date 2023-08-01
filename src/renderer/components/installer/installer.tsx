import { useCallback, useEffect, useState } from "react";
import { Box, Button, ButtonProps, CircularProgress } from "@mui/material";

import { TInstallations, TInstallationState } from "interfaces/installations";

const InstallationButtonColor = (value: TInstallationState): ButtonProps['color'] => {
    switch(value) {
        case TInstallationState.Installed:
            return 'success';
        case TInstallationState.Installing:
            return 'warning';
        case TInstallationState.NotInstalled:
            return 'error';
        case TInstallationState.Unknown:
            return 'secondary';
    }
}

const InstallationProgress = (
    { name, value, onClick } : { name: string; value: TInstallationState, onClick?: () => void }
) => {
    return (
        <Box>
            { value === TInstallationState.Installing ? <CircularProgress /> : null }
            <Button
                onClick={onClick}
                variant='contained'
                color={InstallationButtonColor(value)}
            >
                {name} {value}
            </Button>
        </Box>
    );
}

export const Installer = () => {
    const [installations, setInstallations] = useState<TInstallations>({
        has_python: TInstallationState.Unknown,
        has_pip: TInstallationState.Unknown,
        has_pipenv: TInstallationState.Unknown,
        has_server: TInstallationState.Unknown,
        has_basic: TInstallationState.Unknown,
        has_music: TInstallationState.Unknown,
        has_diffusers: TInstallationState.Unknown,
    });
    
    useEffect(() => {
        window.api.testInstallations().then(setInstallations);
    }, []);

    const installPython = useCallback(async () => {
        if (installations.has_python === TInstallationState.Installed) return;

        setInstallations({ ...installations, has_python: TInstallationState.Installing })
        const response = await window.api.installPython()
        if (response === 'success') {
            setInstallations({ ...installations, has_python: TInstallationState.Installed })
        } else {
            setInstallations({ ...installations, has_python: TInstallationState.NotInstalled })
        }
    }, [installations]);

    return <div>
        <InstallationProgress name='has python' value={installations.has_pip} onClick={installPython}/>
        <InstallationProgress name='has pip' value={installations.has_pip}/>
        <InstallationProgress name='has pipenv' value={installations.has_pipenv}/>
        <InstallationProgress name='has server' value={installations.has_server}/>
        <InstallationProgress name='has basic' value={installations.has_basic}/>
        <InstallationProgress name='has music' value={installations.has_music}/>
        <InstallationProgress name='has diffusers' value={installations.has_diffusers}/>
    </div>;
}
