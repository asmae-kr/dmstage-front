// src/app/services/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');

  // Ne PAS ajouter le token pour la route /login
  if (token && !req.url.includes('/login')) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
    return next(cloned);
  }

  return next(req);
};
