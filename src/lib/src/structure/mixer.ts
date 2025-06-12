import { ILogger, IRule, IRuleset } from "../interfaces";
import { NetworkQueryies } from "./network";
import { RootRule, Rule } from "./rule";
import { ISong } from "./song";

export const mix = async (r: IRuleset, clientId: string, logger: ILogger) => {
    const root = new RootRule(r.rules);
    const resultPlaylist: ISong[] = [];
    const qManager = new NetworkQueryies(clientId, logger);
    validation(root);

    const sourceSongs = await qManager.fetchPlaylist(r.source);
    for (const song of sourceSongs) {
        root.addSong(song);
    }
    logger.log('Structure of rules:', 'standard');
    logger.log(root.toString(), 'standard');
    validationSongs(root);
    root.prepare();

    let i = 0;
    while ((r.length === -1 && !root.isOnRepeat()) || i < r.length) {
        resultPlaylist.push(root.getNext());
        i++;
    }

    await qManager.uploadPlaylist(resultPlaylist.map(s => s.uri), r.name);
};

const validation = (r: RootRule | Rule) => {
    if (r instanceof RootRule) {
        if (!r.getSubrules().length) {
            throw new Error('There are no rules!');
        }
        checkProbabilities(r.rule.subrules);
        for (const rule of r.getSubrules()) {
            validation(rule);
        }
    } else {
        if (r.getSubrules().length) {
            checkProbabilities(r.rule.subrules);
            for (const rule of r.getSubrules()) {
                validation(rule);
            }
        }
    }
};

const checkProbabilities = (r: IRule[]) => {
    let sum = 0;
    for (const rule of r) {
        if (rule.probability < 0 || rule.probability > 100) {
            throw new Error('Every probability should be between 0 and 100!')
        } else if (rule.min !== null && rule.max !== null && rule.min > rule.max) {
            throw new Error('Min cannot be greater than max!');
        }
        sum += rule.probability;
    }
    if (sum !== 100 && r.length) {
        throw new Error('Probabilities should add up to 100 in every level of hierarchy!')
    }
};

const validationSongs = (r: Rule) => {
    if (!r.getSubrules().length) {
        if (!r.getSongCount()) {
            throw new Error('There is a rule without any songs!');
        }
    } else {
        for (const rule of r.getSubrules()) {
            validationSongs(rule);
        }
    }
};
