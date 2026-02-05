import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, Subject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

let refreshing = false;
const refreshDone$ = new Subject<boolean>();

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<any> => {
  const auth = inject(AuthService);

  const access = auth.getAccessToken();
  const isTokenEndpoint = req.url.includes('/o/token/');
  const isAuthEndpoint = req.url.includes('/o/authorize/');

  const authReq = (access && !isTokenEndpoint && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) return throwError(() => err);

      // If unauthorized and we have a refresh token, attempt refresh once.
      if (err.status === 401 && !isTokenEndpoint) {
        if (!refreshing) {
          refreshing = true;
          refreshDone$.next(false);

          return auth.refreshToken().pipe(
            switchMap(() => {
              refreshing = false;
              refreshDone$.next(true);
              const newAccess = auth.getAccessToken();
              const retry = newAccess ? req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } }) : req;
              return next(retry);
            }),
            catchError((refreshErr) => {
              refreshing = false;
              refreshDone$.next(false);
              // give up -> propagate original 401
              return throwError(() => refreshErr);
            })
          );
        }

        // Wait ongoing refresh
        return refreshDone$.pipe(
          filter(done => done === true),
          take(1),
          switchMap(() => {
            const newAccess = auth.getAccessToken();
            const retry = newAccess ? req.clone({ setHeaders: { Authorization: `Bearer ${newAccess}` } }) : req;
            return next(retry);
          })
        );
      }

      return throwError(() => err);
    })
  );
};
