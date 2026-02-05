export type TokenSet = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

const KEY = 'oauth.tokens';

export class TokenStore {
  static get(): TokenSet | null {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as TokenSet; } catch { return null; }
  }
  static set(tokens: TokenSet) {
    localStorage.setItem(KEY, JSON.stringify(tokens));
  }
  static clear() {
    localStorage.removeItem(KEY);
  }
}
