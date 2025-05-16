import { useState } from "react";
import { ISettingsData } from "../App";

interface ISettings {
    settings: ISettingsData,
    onChange?: (settings: ISettingsData) => void,
}

function Settings({settings, onChange}: ISettings) {
    const [currentSettings, setCurrentSettings] = useState(settings);

    function updateSettings(data: Partial<ISettingsData>) {
        const newState = {
            ...currentSettings,
            ...data,
        }
        setCurrentSettings(newState);
        onChange && onChange(newState);
    }

    return (
        <>
            <label htmlFor="user-id">Spotify user ID:</label>
            <input type="text" className="form-control" id="user-id" placeholder="Spotify user ID" value={currentSettings.userId} onChange={(e) => updateSettings({userId: e.target.value})}></input>
            <label htmlFor="client-id">Client ID:</label>
            <input type="text" className="form-control" id="client-id" placeholder="Client ID" value={currentSettings.clientId} onChange={(e) => updateSettings({clientId: e.target.value})}></input>
            <label htmlFor="client-secret">Client secret:</label>
            <input type="text" className="form-control" id="client-secret" placeholder="Client secret" value={currentSettings.clientSecret} onChange={(e) => updateSettings({clientSecret: e.target.value})}></input>
        </>
    );
}

export default Settings;