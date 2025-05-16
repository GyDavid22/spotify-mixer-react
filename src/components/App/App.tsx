import { useEffect, useState } from 'react';
import './App.css';
import RuleEditor from './RuleEditor/RuleEditor';
import Settings from './Settings/Settings';
import Icon from './Icon/Icon';
import RulePicker from './RulePicker/RulePicker';
import Button from './Button/Button';
import Console from './Console/Console';
import * as bootstrap from 'bootstrap';
 
export interface ISettingsData {
    userId: string;
    clientId: string;
    clientSecret: string;
}

function App() {
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
  });
  let initialSettings: ISettingsData | undefined;
  if (typeof localStorage !== 'undefined' && localStorage) {
    const local = localStorage.getItem('authSettings');
    if (local) {
      initialSettings = JSON.parse(local);
    }
  }
  const [settings, setSettings] = useState(initialSettings ? initialSettings : {
    userId: '',
    clientId: '',
    clientSecret: '',
  } as ISettingsData);
  const recieveSettings = (newSettings: ISettingsData) => {
    setSettings(newSettings);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('authSettings', JSON.stringify(newSettings));
    }
  };

  return (
    <>
      <h1 className='mb-5 mt-4'><Icon name='bi-spotify me-3'></Icon>Spotify Mixer</h1>
      <div className='d-flex flex-column gap-1'>       
        <p className='small mb-0 text-body-secondary'>
          <a className='me-1' href='https://developer.spotify.com/documentation/web-api/concepts/apps' target='_blank' rel="_ noreferrer">
            How can I get these?
          </a>
          <span data-bs-toggle="tooltip" data-bs-title="Make sure to add the current URL to the redirect URIs!"><Icon name='bi-question-circle-fill'></Icon></span>
        </p>
        <Settings settings={settings} onChange={recieveSettings}></Settings>
        <div className='my-1'></div>
        <RulePicker></RulePicker>
        <RuleEditor></RuleEditor>
        <div className='my-1'></div>
        <div className='d-flex align-items-center gap-2'>
          <Button text='Start mixing!' iconName='bi-vinyl-fill' styleName='success' fill={true}></Button>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <Icon name='bi-check-lg text-success checkmark'></Icon>
        </div>
        <div className='my-1'></div>
          {true && (<><Console messages={[{message: 'Console is working!', type: 'standard'}]}></Console><div className='my-1'></div></>)}
        <div>
          <h5>Why?</h5>
          <p>Spotify mixes are great, but there is one problem: they are too specific. With this web app, you can create mixes with more variety and predefined ratios from an already existing pool of songs.</p>
          <p>Let's imagine one scenario: You would like to listen to old music and new ones as well, but you have 1000 old songs and only 20 new ones. Shuffle doesn't help you out, you would mostly hear old ones, with the new ones here and there. Spotify mixes would create lists only with either old or new songs. With this web app you can specify ratios: e.g. 80% music from the '80s and 20% since 2020. This way you can give each category as much attention as you would like to, without creating the playlists manually, sparing time, resulting in a personalized radio-like experience.</p>
        </div>
      </div>
      <footer className='d-flex justify-content-center my-3 text-body-secondary'>
        <a className='github-link' href='https://github.com/GyDavid22/spotify-mixer-react' target='_blank' rel='_ noreferrer'>
          <Icon name='bi-github'></Icon>
        </a>
      </footer>
    </>
  );
}

export default App;
