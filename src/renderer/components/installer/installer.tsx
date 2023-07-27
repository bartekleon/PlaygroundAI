import { useEffect, useState } from "react";
import { TInstallations, TInstallationState } from "interfaces/installations";

const InstallationProgress = ({ name, value } : { name: string; value: TInstallationState }) => {
    return <div>{name} {value}</div>
}

export const Installer = () => {
    const [installations, setInstallations] = useState<TInstallations>({
        has_pip: TInstallationState.Unknown,
        has_pipenv: TInstallationState.Unknown,
    });
    
    useEffect(() => {
        window.api.testInstallations().then(setInstallations);
    }, []);
    

    return <div>
        <InstallationProgress name='has pip' value={installations.has_pip}/>
        <InstallationProgress name='has pipenv' value={installations.has_pipenv}/>
    </div>;
}
