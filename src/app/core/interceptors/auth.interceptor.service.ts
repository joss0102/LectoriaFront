import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh')) {
    return next(req);
  }

  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    req = addToken(req, accessToken);
  }
  return next(req).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Token expirado, intentamos refrescarlo
        return handleRefreshToken(req, next, authService, router);
      } else {
        return throwError(() => error);
      }
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`
    }
  });
}

function handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService, router: Router) {
  return authService.refreshToken().pipe(
    switchMap((response) => {
      return next(addToken(request, response.access_token));
    }),
    catchError((err) => {
      // Si falla el refresh, cerrar sesión
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
}