export class Song {
    constructor(public title: string, public artist: string[], public spotifyId: string, public year: number, public popularity: number) {}

    toString() {
        return `${this.artist.join(', ')} - ${this.title} (${this.year})`;
    }
}

/**
 * Dictionary to keep track of which playlists have been already processed into an object.
 * 
 * Key is the ID of the playlist, value represents a downloaded playlist.
 */
export const ALREADY_DOWNLOADED: { [x: string]: Song[] } = {};