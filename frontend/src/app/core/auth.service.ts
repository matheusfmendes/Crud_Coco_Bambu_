import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, from, map, of, switchMap, tap } from 'rxjs';
import { environment } from './env';
import { TokenStore, TokenSet } from './token.store';
import { pkceChallengeFromVerifier, randomString } from './pkce';

type Me = { id: number; name: string; email: string; is_superuser: boolean };

const VERIFIER_KEY = 'pkce.verifier';
const STATE_KEY = 'pkce.state';
const ME_KEY = 'auth.me';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private me$ = new BehaviorSubject<Me | null>(this.readMe());

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    return !!TokenStore.get()?.access_token;
  }

  email(): Observable<string | null> {
    return this.me$.pipe(map(m => m?.email ?? null));
  }

  isAdmin(): Observable<boolean> {
    return this.me$.pipe(map(m => !!m?.is_superuser));
  }

  getAccessToken(): string | null {
    return TokenStore.get()?.access_token ?? null;
  }

    sessionLogin(email: string, password: string): Observable<any> {
    return this.http.post(
      environment.apiBaseUrl + '/api/session/login/',
      { email, password },
      { withCredentials: true }
    );
  }

  startLogin(): Observable<void> {
    return from(this.buildAuthorizeUrl()).pipe(
      tap(url => window.location.href = url),
      map(() => void 0)
    );
  }

isLoggedIn$(): Observable<boolean> {
  return this.me$.pipe(map(me => !!me));
}

  private async buildAuthorizeUrl(): Promise<string> {
    const verifier = randomString(72);
    const challenge = await pkceChallengeFromVerifier(verifier);
    const state = randomString(24);

    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);

    const u = new URL(environment.apiBaseUrl + '/o/authorize/');
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', environment.oauthClientId);
    u.searchParams.set('redirect_uri', environment.redirectUri);
    u.searchParams.set('code_challenge', challenge);
    u.searchParams.set('code_challenge_method', 'S256');
    u.searchParams.set('scope', environment.scope);
    u.searchParams.set('state', state);
    return u.toString();
  }

  exchangeCodeForToken(code: string, state: string): Observable<TokenSet> {
    const expected = sessionStorage.getItem(STATE_KEY);
    if (!expected || expected !== state) {
      return of(null as any).pipe(
        switchMap(() => { throw new Error('State inválido'); })
      );
    }
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!verifier) {
      return of(null as any).pipe(
        switchMap(() => { throw new Error('PKCE verifier ausente'); })
      );
    }

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', environment.oauthClientId)
      .set('code', code)
      .set('redirect_uri', environment.redirectUri)
      .set('code_verifier', verifier);

    return this.http.post<TokenSet>(environment.apiBaseUrl + '/o/token/', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(tokens => TokenStore.set(tokens)),
      switchMap(() => this.fetchMe().pipe(map(() => TokenStore.get()!)))
    );
  }

  refreshToken(): Observable<TokenSet> {
    const refresh = TokenStore.get()?.refresh_token;
    if (!refresh) return of(null as any).pipe(switchMap(() => { throw new Error('No refresh token'); }));

    const body = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('client_id', environment.oauthClientId)
      .set('refresh_token', refresh);

    return this.http.post<TokenSet>(environment.apiBaseUrl + '/o/token/', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(tokens => TokenStore.set(tokens))
    );
  }

  fetchMe(): Observable<Me> {
    return this.http.get<Me>(environment.apiBaseUrl + '/api/me/').pipe(
      tap(me => {
        this.me$.next(me);
        localStorage.setItem(ME_KEY, JSON.stringify(me));
      })
    );
  }

  logout(): Observable<void> {
    const tokens = TokenStore.get();
    TokenStore.clear();
    this.me$.next(null);
    localStorage.removeItem(ME_KEY);

    if (!tokens?.refresh_token) return of(void 0);

    const body = new HttpParams()
      .set('token', tokens.refresh_token)
      .set('client_id', environment.oauthClientId);

    return this.http.post(environment.apiBaseUrl + '/o/revoke_token/', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      map(() => void 0),
      catchError(() => of(void 0))
    );
  }

  private readMe(): Me | null {
    const raw = localStorage.getItem(ME_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as Me; } catch { return null; }
  }
}
