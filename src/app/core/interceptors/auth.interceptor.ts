import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // 🔑 Ajouter le token sur toutes les requêtes
  const authReq = token ? req.clone({
    headers: req.headers
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
  }) : req;

  return next(authReq).pipe(
    catchError(error => {
      // 🚫 Token expiré ou invalide
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
