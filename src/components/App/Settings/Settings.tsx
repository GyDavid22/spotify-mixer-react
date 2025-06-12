import { useEffect } from "react";
import { ISettingsData } from "../../../lib/index";
import * as bootstrap from "bootstrap";
import Icon from "../Icon/Icon";

interface ISettings {
    settings: ISettingsData,
    onChange: (settings: ISettingsData) => void,
}

function Settings({settings, onChange}: ISettings) {
    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
    });
    function updateSettings(data: Partial<ISettingsData>) {
        const newState = {
            ...settings,
            ...data,
        }
        onChange(newState);
    }

    return (
        <>
            <p className='small mb-0 text-body-secondary'>
                <a className='me-1' href='https://developer.spotify.com/documentation/web-api/concepts/apps' target='_blank' rel="_ noreferrer">
                    How can I get this?
                </a>
                <span data-bs-toggle="tooltip" data-bs-title={`Make sure to add the current URL to the redirect URIs! (${window.location.origin + window.location.pathname})`}><Icon classNames='bi-question-circle-fill'></Icon></span>
            </p>
            <label htmlFor="client-id">Client ID:</label>
            <input type="text" className="form-control" id="client-id" placeholder="Client ID" value={settings.clientId} onChange={(e) => updateSettings({clientId: e.target.value})} required></input>
        </>
    );
}

export default Settings;