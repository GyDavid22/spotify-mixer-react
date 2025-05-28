import { ILogger } from "../interfaces";
import { ALREADY_DOWNLOADED, ISong } from "./song";

interface ImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

interface ExplicitContent {
  filter_enabled: boolean;
  filter_locked: boolean;
}

interface ExternalUrls {
  spotify: string;
}

interface Followers {
  href: string | null;
  total: number;
}

interface SpotifyUser {
  country?: string; // ISO 3166-1 alpha-2, optional if no permission
  display_name: string | null;
  email?: string; // optional if no permission
  explicit_content?: ExplicitContent;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: ImageObject[];
  product?: string; // "premium", "free", etc.
  type: string; // "user"
  uri: string;
}

interface IPlaylist {
    next?: string,
    items: {
        track: {
            album: {
                release_date: string,
            },
            id: string,
            popularity: number,
        },
    }[],
};

export class AuthAgent {
    private static instance: AuthAgent;

    private constructor(private clientId: string) { }

    static getInstance(clientId: string) {
        if (!AuthAgent.instance) {
            AuthAgent.instance = new AuthAgent(clientId);
        }
        return AuthAgent.instance;
    }

    /**
     * This code is mostly copied from the Spotify docs.
     * 
     * As a result it redirects the user to the Spotify authentication page.
     */
    private async authentication() {
        const generateRandomString = (length: number) => {
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const values = crypto.getRandomValues(new Uint8Array(length));
            return values.reduce((acc, x) => acc + possible[x % possible.length], "");
        };

        const codeVerifier = generateRandomString(64);

        const sha256 = async (plain: string) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(plain);
            return window.crypto.subtle.digest('SHA-256', data);
        };

        const base64encode = (input: ArrayBuffer) => {
            const uint8Array = new Uint8Array(input);
            const numberArray: number[] = [];
            uint8Array.forEach(a => numberArray.push(a));
            return btoa(String.fromCharCode(...numberArray))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
        };

        const hashed = await sha256(codeVerifier)
        const codeChallenge = base64encode(hashed);

        const redirectUri = window.location.origin + window.location.pathname;

        const scope = 'playlist-modify-public playlist-modify-private playlist-read-private user-library-read user-read-private';
        const authUrl = new URL("https://accounts.spotify.com/authorize");

        window.localStorage.setItem('code_verifier', codeVerifier);

        const params = {
            response_type: 'code',
            client_id: this.clientId,
            scope,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            redirect_uri: redirectUri,
        }

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
    }

    /**
     * This code is mostly copied from the Spotify docs
     */
    private readCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) {
            const error = urlParams.get('error');
            if (error) {
                throw new Error(`Authentication failed. Response from the API: ${error}`);
            }
        }
        return code;
    }

    /**
     * This code has a lot of copied parts from the Spotify docs
     */
    async getToken() {
        let body, response;
        const refreshToken = localStorage.getItem('refresh_token');
        const tokenExpiryDate = localStorage.getItem('token_expiry_date');
        if (!localStorage.getItem('access_token') || !refreshToken || !tokenExpiryDate) {
            const code = this.readCode();
            const codeVerifier = localStorage.getItem('code_verifier');
            if (!codeVerifier || !code) {
                this.authentication();
                return;
            }

            const url = "https://accounts.spotify.com/api/token";
            const payload = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: window.location.origin + window.location.pathname,
                    code_verifier: codeVerifier,
                }),
            }

            body = await fetch(url, payload);
            response = await body.json();

            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
             // Set token expiration date to the received date minus one minute
            localStorage.setItem('token_expiry_date', new Date(new Date().getTime() + response.expires_in * 1000 - 60 * 1000).toISOString());
        } else if (new Date() > new Date(tokenExpiryDate)) {
            // refresh token that has been previously stored
            const url = "https://accounts.spotify.com/api/token";

            const payload = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: this.clientId
                }),
            }
            body = await fetch(url, payload);
            response = await body.json();

            localStorage.setItem('access_token', response.access_token);
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }
             // Set token expiration date to the received date minus one minute
            localStorage.setItem('token_expiry_date', new Date(new Date().getTime() + response.expires_in * 1000 - 60 * 1000).toISOString());
        } else {
            return localStorage.getItem('access_token')!;
        }

        if (body.status !== 200) {
            throw new Error(`Something went wrong with the authentication. Status: ${body.status}, message: ${await body.text}`);
        }
        return localStorage.getItem('access_token')!;
    }
}

export class QueryError extends Error {
    constructor(error: number, message: string) {
        super(`Something went wrong during a query. Error code: ${error}, error message: ${message}`);
    }
}

export class NetworkQueryies {
    private authInstance: AuthAgent;
    private BASE_URL = 'https://api.spotify.com';

    constructor(clientId: string, private logger?: ILogger) {
        this.authInstance = AuthAgent.getInstance(clientId);
    }

    private async queryBuilder(method: 'GET', url: string, headers?: object, relativeUrl: boolean = true) {
        const token = await this.authInstance.getToken();
        const queryHeaders = {
            'Authorization': `Bearer ${token}`,
            ...headers,
        }
        const response = await fetch(relativeUrl ? this.BASE_URL + url : url, {
            method,
            headers: queryHeaders,
        });
        if (response.status !== 200) {
            throw new QueryError(response.status, await response.text());
        }
        return response;
    }

    async getUserId() {
        this.logger?.log('Fetching user ID')
        const response = await this.queryBuilder('GET', '/v1/me');
        return (await response.json() as SpotifyUser).id;
    }

    private async fetchPlaylistChunk(url: string) {
        return await (await this.queryBuilder('GET', url, undefined, true)).json() as IPlaylist;
    }

    async fetchPlaylist(id: string) {
        if (ALREADY_DOWNLOADED[id]) {
            this.logger?.log(`Skipping playlist with ID ${id}, it is already cached`);
            return;
        }
        this.logger?.log('Beginning of fetching the playlist with ID ' + id);
        const relativeUrl = id.toLowerCase() === 'liked' ? '/me/tracks' : '/playlists/' + id + '/tracks';
        const url = this.BASE_URL + relativeUrl;
        const params = {
            playlist_id: id,
            fields: 'next,items(track(album(release_date),id,popularity))',
            limit: '50',
        };
        const result: ISong[] = [];
        let current = await this.fetchPlaylistChunk(url + new URLSearchParams(params).toString());
        let needToProcess = true;
        while (needToProcess) {
            result.push(...current.items.map((s): ISong => {
                const release_date = s.track.album.release_date;
                const indexOfHyphen = release_date.indexOf('-');
                const year = parseInt(release_date.slice(0, indexOfHyphen === -1 ? undefined : indexOfHyphen));
                return { year, popularity: s.track.popularity, id: s.track.id };
            }));
            needToProcess = current.next !== undefined;
            if (needToProcess) {
                current = await this.fetchPlaylistChunk(current.next!);
            }
        }
        this.logger?.log('Fetching successful');
        ALREADY_DOWNLOADED[id] = result;
    }

    async uploadPlaylist(uris: string[], name: string) {
        const metadata = {
            name,
            description: 'Made with Spotify Mixer',
            public: false,
        };
        const header = {
            'Content-Type': 'application/json',
        };
    }
}