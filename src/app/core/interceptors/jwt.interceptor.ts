import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const keycloak = inject(KeycloakService);

  return from(keycloak.getToken()).pipe(
    switchMap((token) => {
      if (token) {
        const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        return next(cloned);
      }
      return next(req);
    })
  );
};
