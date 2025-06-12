import { IRule } from "../interfaces";
import { ISong } from "./song";

export class Rule {
    private songs: ISong[] = [];
    private playedSongs: ISong[] = [];
    private songsToPlay: ISong[] = [];
    private compareFunc: (s: ISong) => number;
    private subRules: Rule[];
    private isRepeating: boolean;

    constructor(public rule: IRule) {
        if (this.rule.type === 'popularity') {
            this.compareFunc = (s) => s.popularity;
        } else {
            this.compareFunc = (s) => s.year;
        }
        this.subRules = [];
        for (const subrule of this.rule.subrules) {
            this.subRules.push(new Rule(subrule));
        }
        this.isRepeating = false;
    }

    addSong(s: ISong) {
        if ((this.rule.min === null && this.rule.max === null)
            || (this.rule.min === null && this.compareFunc(s) <= this.rule.max!)
            || (this.rule.max === null && this.rule.min! <= this.compareFunc(s))
            || (this.rule.min! <= this.compareFunc(s) && this.rule.max! >= this.compareFunc(s))) {
            if (this.subRules.length) {
                for (const subrule of this.subRules) {
                    subrule.addSong(s);
                }
            } else {
                this.songs.push(s);
            }
        }
    }

    prepare() {
        if (this.subRules.length) {
            for (const subrule of this.subRules) {
                subrule.prepare();
            }
        } else {
            this.playedSongs = [];
            this.songsToPlay = [ ...this.songs ];
            for (let i = 0; i < this.songsToPlay.length; i++) {
                const j = Math.floor(Math.random() * this.songsToPlay.length);
                [this.songsToPlay[i], this.songsToPlay[j]] = [this.songsToPlay[j], this.songsToPlay[i]];
            }
        }
    }

    getNext(): ISong {
        if (this.subRules.length) {
            const selectedPercent = Math.floor(Math.random() * 100) + 1; // [1, 100]
            let bottom = 0;
            let top = 0;
            for (const subrule of this.subRules) {
                top += subrule.rule.probability;
                if (selectedPercent > bottom && selectedPercent <= top) {
                    return subrule.getNext();
                }
                bottom = top;
            }
        } else {
            if (this.rule.useUp) {
                const selected = this.songsToPlay.pop()!;
                this.playedSongs.push(selected);
                if (!this.songsToPlay.length) {
                    this.prepare();
                    this.isRepeating = true;
                }
                return selected;
            }
        }
        return this.songsToPlay[Math.floor(Math.random() * this.songsToPlay.length)];
    }

    isOnRepeat(): boolean {
        if (this.subRules.length) {
            for (const subrule of this.subRules) {
                if (subrule.isOnRepeat()) {
                    return true;
                }
            }
            return false;
        }
        return this.isRepeating;
    }

    getSongCount() {
        return this.songs.length;
    }

    getSubrules() {
        return this.subRules;
    }

    toString() {
        const val = `Probability: ${this.rule.probability}, type: ${this.rule.type}, min: ${this.rule.min}, max: ${this.rule.max}, use up: ${this.rule.useUp}${this.songs.length ? `, count of songs: ${this.songs.length}` : ''}\n`;
        let subrules = '';
        for (const subrule of this.subRules) {
            subrules += `    ${subrule.toString()}`;
        }
        return val + subrules;
    }
}

export class RootRule extends Rule {
    constructor(rules: IRule[]) {
        super({
            probability: 100,
            type: "year",
            min: null,
            max: null,
            useUp: false,
            subrules: rules,
        });
    }

    override toString() {
        let result = '';
        this.getSubrules().forEach(r => result += r.toString());
        return result;
    }
}
