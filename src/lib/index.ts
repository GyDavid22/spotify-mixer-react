import { ILogger, IRuleset, ISettingsData } from "./src/interfaces"

export const main = (logger: ILogger, settings: ISettingsData, rules: IRuleset) => {
    try {
        // ...
    } catch (e) {
        logger.log(e, 'error');
    }
};

export * from './src/interfaces';