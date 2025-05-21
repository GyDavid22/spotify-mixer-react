export type RuleType = 'year' | 'popularity';

export interface ISettingsData {
    userId: string;
    clientId: string;
    clientSecret: string;
}

export interface Rule {
  probability: number,
  type: RuleType,
  min: number | null,
  max: number | null,
  subrules: Rule[],
}

export interface Ruleset {
  name: string,
  length: number,
  rules: Rule[],
}