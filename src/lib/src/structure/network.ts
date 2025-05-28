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

class AuthAgent {
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
    private async beginAuthentication() {
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

        const scope = 'playlist-modify-public playlist-modify-private playlist-read-private user-library-read user-read-private user-read-email';
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
     * This code is mostly copied from the Spotify docs
     */
    async refreshToken() {
        let body, response;
        const refreshToken = localStorage.getItem('refresh_token');
        const tokenExpiryDate = localStorage.getItem('token_expiry_date');
        if (!localStorage.getItem('access_token') || !refreshToken || !tokenExpiryDate) {
            const code = this.readCode();
            const codeVerifier = localStorage.getItem('code_verifier');
            if (!codeVerifier || !code) {
                this.beginAuthentication();
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

    constructor(clientId: string) {
        this.authInstance = AuthAgent.getInstance(clientId);
    }

    async getUserId() {
        const token = await this.authInstance.refreshToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
        };
        const response = await fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers,
        });
        if (response.status !== 200) {
            throw new QueryError(response.status, await response.text());
        }
        return (await response.json() as SpotifyUser).id;
    }
}