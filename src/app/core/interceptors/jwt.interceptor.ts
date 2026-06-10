import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { from, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const keycloak = inject(Keycloak);

  return from(keycloak.updateToken(5).catch(() => false)).pipe(
    switchMap(() => {
      const token = keycloak.token;
      if (token) {
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next(cloned);
      }
      return next(req);
    })
  );
};
