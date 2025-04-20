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
export class AdminGuardService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      // Verificamos que el token sea válido y que el usuario sea admin
      return this.authService.verifyToken().pipe(
        map(() => {
          const user = this.authService.currentUserValue;
          if (user && user.role === 'admin') {
            return true;
          } else {
            // Redirigir a página no encontrada si no es admin
            this.router.navigate(['/not-found']);
            return false;
          }
        }),
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

export const AdminGuard: CanActivateFn = (route, state) => {
  return inject(AdminGuardService).canActivate();
};