export interface ISong {
    year: number,
    popularity: number,
    id: string,
};

/**
 * Dictionary to keep track of which playlists have been already processed into an object.
 * 
 * Key is the ID of the playlist, value represents a downloaded playlist.
 */
export const ALREADY_DOWNLOADED: { [x: string]: ISong[] } = {};