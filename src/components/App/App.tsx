import { useCallback, useEffect, useState } from 'react';
import './App.css';
import RuleEditor from './RuleEditor/RuleEditor';
import Settings from './Settings/Settings';
import Icon from './Icon/Icon';
import RulePicker from './RulePicker/RulePicker';
import Button from './Button/Button';
import Console, { IConsoleItem } from './Console/Console';
import { ISettingsData, IRuleset, ILogger, MessageType, main } from '../../lib/index';

type QueryState = 'ready' | 'pending' | 'success' | 'error';

function App() {
  let initialSettings: ISettingsData | undefined;
  if (typeof localStorage !== 'undefined' && localStorage) {
    const local = localStorage.getItem('authSettings');
    if (local) {
      initialSettings = JSON.parse(local);
    }
  }
  let initialRulesets: IRuleset[] | undefined;
  if (typeof localStorage !== 'undefined' && localStorage) {
    const local = localStorage.getItem('rulesets');
    if (local) {
      initialRulesets = JSON.parse(local);
    }
  }
  let initialSelected: number | undefined;
  if (typeof localStorage !== 'undefined' && localStorage) {
    const local = localStorage.getItem('selectedRuleset');
    if (local) {
      initialSelected = parseInt(JSON.parse(local));
    }
  }
  const [settings, setSettings] = useState(initialSettings ? initialSettings : {
    clientId: '',
  } as ISettingsData);
  const recieveSettings = (newSettings: ISettingsData) => {
    setSettings(newSettings);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('authSettings', JSON.stringify(newSettings));
    }
  };
  const [queryState, setQueryState] = useState<QueryState>('ready');
  const [rulesets, setRulesets] = useState<IRuleset[]>(initialRulesets ?? []);
  const [selectedRuleset, setSelectedRuleset] = useState<number>(initialSelected ?? -1);
  const saveRuleset = (rules: IRuleset[]) => {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('rulesets', JSON.stringify(rules));
    }
  };
  const rulesetSaveHandler = (name: string) => {
    const result = [...rulesets, { name, length: 0, source: '', rules: [] } as IRuleset];
    setRulesets(result);
    saveRuleset(result);
  };
  const rulesetChangeHandler = (index: number) => {
    setSelectedRuleset(index);
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem('selectedRuleset', JSON.stringify(index));
    }
  };
  const rulesetDeleteHandler = (index: number) => {
    const result = [ ...rulesets.slice(0, index), ...rulesets.slice(index + 1) ];
    setRulesets(result);
    saveRuleset(result);
  };
  const rulesetUpdateHandler = (r: IRuleset) => {
    const result = [ ...rulesets.slice(0, selectedRuleset), r, ...rulesets.slice(selectedRuleset + 1) ];
    setRulesets(result);
    saveRuleset(result);
  }
  const downloadHandler = () => {
    const file = new Blob([JSON.stringify(rulesets, null, 0)], { type: 'application/json' });
    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rulesets_${new Date().toISOString()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };
  const uploadHandler = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async () => {
        if (input.files?.[0]) {
            const text = await input.files[0].text();
            try {
                const json = JSON.parse(text);
                setRulesets(json);
                rulesetChangeHandler(-1);
                saveRuleset(json);
            } catch { }
        }
    };

    input.click();
  };
  const [consoleItems, setConsoleItems] = useState<IConsoleItem[]>([]);
  const startHandler = useCallback(async () => {
    setQueryState('pending');
    const logger = new ConcreteLogger(setConsoleItems);
    const result = await main(logger, settings, rulesets[selectedRuleset]);
    if (result) {
      setQueryState('success'); 
    } else {
      setQueryState('error');
    }
  }, [rulesets, selectedRuleset, settings]);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('code')) {
      document.getElementById('console')?.scrollTo();
      startHandler();
    }
  }, [startHandler]);

  return (
    <>
      <h1 className='mb-5 mt-4'><Icon classNames='bi-spotify me-3'></Icon>Spotify Mixer</h1>
      <div className='d-flex flex-column gap-1'>       
        <fieldset disabled={queryState === 'pending'} className='d-flex flex-column gap-1'>
          <Settings settings={settings} onChange={recieveSettings}></Settings>
          <div className='my-1'></div>
          <RulePicker rules={rulesets.map(r => { return { name: r.name } })} selectedIndex={selectedRuleset} onChange={rulesetChangeHandler} onDelete={rulesetDeleteHandler} onSave={rulesetSaveHandler} onDownload={downloadHandler} onUpload={uploadHandler}></RulePicker>
          { selectedRuleset !== -1 && <RuleEditor ruleset={rulesets[selectedRuleset]} onChange={rulesetUpdateHandler}></RuleEditor>}
          <div className='my-1'></div>
          <div className='d-flex align-items-center gap-2'>
            <Button text='Start mixing!' iconName='bi-vinyl-fill' styleName='success' fill={true} onClick={startHandler}></Button>
            {
              queryState === 'pending' ? (
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : queryState === 'success' ? (
                <Icon classNames='bi-check-lg text-success result-symbol'></Icon>
              ) : queryState === 'error' ? (
                <Icon classNames='bi-x-lg text-danger result-symbol'></Icon>
              ) : <></>
            }
          </div>
        </fieldset>
        <div className='my-1'></div>
          <div id='console'>
            <Console messages={consoleItems}></Console>
            <div className='my-1'></div>
          </div>
        <div>
          <h5>
            Why?
          </h5>
          <p>
            Spotify mixes are great, but there is one problem: they are too specific. With this web app, you can create mixes with more variety and predefined ratios from an already existing pool of songs.
          </p>
          <p>
            Let's imagine one scenario: You would like to listen to old music and new ones as well, but you have 1000 old songs and only 20 new ones. Shuffle doesn't help you out, you would mostly hear old ones, with the new ones here and there. Spotify mixes would create lists only with either old or new songs. With this web app you can specify ratios: e.g. 80% music from the '80s and 20% since 2020. This way you can give each category as much attention as you would like to, without creating the playlists manually, sparing time, resulting in a personalized radio-like experience.
          </p>
          <h5>
            Data privacy
          </h5>
          <p>
            This app doesn't use any backend besides the official Spotify APIs. That means your Spotify application credentials are safe and are not forwarded to anyone but Spotify. <b>Every data you input here are stored locally on your computer, using localStorage. Spotify app credentials are not included in the JSON backup for safety reasons.</b>
          </p>
          <h5>
            Why is creating my own app on Spotify Dashboard necessary?
          </h5>
          <p>
            Spotify defines two quota modes for apps: development and extended quota mode. Development mode requires inviting users manually, with a limit of 25 people, so to make an app freely available for end users the latter is necessary. However, <a href='https://developer.spotify.com/documentation/web-api/concepts/quota-modes' target='_blank' rel='_ noreferrer'>according to the documentations</a>, enabling an app for extended quota mode has high requirements, like being a corporation and having at least 250 000 monthly active users.
          </p>
        </div>
      </div>
      <footer className='d-flex justify-content-center my-3 text-body-secondary'>
        <a className='github-link' href='https://github.com/GyDavid22/spotify-mixer-react' target='_blank' rel='_ noreferrer'>
          <Icon classNames='bi-github'></Icon>
        </a>
      </footer>
    </>
  );
}

export class ConcreteLogger implements ILogger {
  private arr: IConsoleItem[];

  constructor(private setter: React.Dispatch<React.SetStateAction<IConsoleItem[]>>) {
    this.arr = [];
    this.setter([]);
  }

  log(message: string | Error, type?: MessageType) {
    let finalText;
    if (message instanceof Error) {
      finalText = message.message;
    } else {
      finalText = message;
    }
    const newArr = [...this.arr, { message: finalText, type: type ?? 'standard' }];
    this.arr = newArr;
    this.setter(newArr);
  };
}

export default App;
