import { ILogger, IRuleset, ISettingsData } from "./src/interfaces";
import { mix } from "./src/structure/mixer";

export const main = async (logger: ILogger, settings: ISettingsData, rules: IRuleset): Promise<boolean> => {
    try {
        await mix(rules, settings.clientId, logger);
        logger.log('Finished successfully', 'success');
    } catch (e) {
        if (e instanceof Error) {
            logger.log(e, 'error');   
        }
        return false;
    }
    return true;
};

export * from './src/interfaces';