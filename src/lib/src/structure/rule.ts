import { IRule } from "../interfaces";
import { Song } from "./song";

// TODO: create root node somehow

export class Rule {
    private songs: Song[] = [];
    private playedSongs: Song[] = [];
    private songsToPlay: Song[] = [];
    private compareFunc: (s: Song) => number;
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

    addSong(s: Song) {
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

    getNext(): Song | null {
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
            } else {
                return this.songsToPlay[Math.floor(Math.random() * this.songsToPlay.length)];
            }
        }
        /* This shouldn't happen as there are validations before getting here
           The only reason for this is to supress errors */
        return null;
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

    toString() {
        const val = `Rule: probability: ${this.rule.probability}, type: ${this.rule.type}, min: ${this.rule.min}, max: ${this.rule.max}, use up: ${this.rule.useUp}${this.songs.length ? `, count of songs: ${this.songs.length}` : ''}\n`;
        let subrules = '';
        for (const subrule of this.subRules) {
            subrules += `    ${subrule.toString()}`;
        }
        return val;
    }
}