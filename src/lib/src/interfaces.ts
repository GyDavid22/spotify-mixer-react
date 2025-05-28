export type RuleType = 'year' | 'popularity';

export interface ISettingsData {
    clientId: string;
}

export interface IRule {
  probability: number,
  type: RuleType,
  min: number | null,
  max: number | null,
  useUp: boolean,
  subrules: IRule[],
}

export const getDefaultRule: () => IRule = () => {
  return {
    probability: 0,
    type: 'year',
    min: null,
    max: null,
    useUp: true,
    subrules: [],
  };
}

export interface IRuleset {
  name: string,
  length: number,
  rules: IRule[],
}

export type MessageType = 'standard' | 'error' | 'success';

export interface ILogger {
  log: (message: string | any, type?: MessageType) => void,
};