import { Injectable, inject } from '@angular/core';
import { 
  CanActivateFn,
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      // Verificamos que el token sea válido contactando al backend
      return this.authService.verifyToken().pipe(
        map(() => true),
        catchError(() => {
          this.router.navigate(['/not-found']);
          return of(false);
        })
      );
    } else {
      // No hay token, redirigir al login
      this.router.navigate(['/login']);
      return false;
    }
  }
}

export const AuthGuard: CanActivateFn = (route, state) => {
  return inject(AuthGuardService).canActivate();
};