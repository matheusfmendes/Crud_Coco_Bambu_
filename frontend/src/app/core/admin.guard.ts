import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) return true;
      router.navigateByUrl('/me');
      return false;
    })
  );
};
