import { useEffect, useState } from "react";
import { ISettingsData } from "../../../lib/index";
import * as bootstrap from "bootstrap";
import Icon from "../Icon/Icon";
import Button from "../Button/Button";
import { AuthAgent } from "../../../lib/src/structure/network";

interface ISettings {
    settings: ISettingsData,
    onChange: (settings: ISettingsData) => void,
}

function Settings({settings, onChange}: ISettings) {
    const [loggedInState, setLoggedInState] = useState<'LOGGED_OUT' | 'PENDING' | 'LOGGED_IN'>('LOGGED_OUT');
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
    async function loginHandler() {
        setLoggedInState('PENDING');
        const result = await AuthAgent.getInstance(settings.clientId).getToken();
        if (result) {
            setLoggedInState('LOGGED_IN');
        } else {
            setLoggedInState('LOGGED_OUT');
        }
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
            <input type="text" className="form-control" id="client-id" placeholder="Client ID" value={settings.clientId} onChange={(e) => updateSettings({clientId: e.target.value})}></input>
            <div>
                {
                    loggedInState === 'LOGGED_OUT' ?
                        <Button text="Authenticate" styleName="success" iconName="bi-lock" onClick={loginHandler}></Button>
                    : loggedInState === 'LOGGED_IN' ?
                        <Button text="Authentication was successful" styleName="success" iconName="bi-unlock" disabled={true}></Button>
                    : loggedInState === 'PENDING' ?
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    : <></>
                }
            </div>
        </>
    );
}

export default Settings;