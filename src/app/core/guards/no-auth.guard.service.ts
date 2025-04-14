import { Injectable, inject } from '@angular/core';
import { 
  CanActivateFn,
  Router, 
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (this.authService.isLoggedIn()) {
      // Verificar rol para redirigir correctamente
      const user = this.authService.currentUserValue;
      if (user && user.role === 'admin') {
        this.router.navigate(['/app/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }
    // Si no está autenticado, permitir acceso a la ruta de login
    return true;
  }
}

export const NoAuthGuard: CanActivateFn = (route, state) => {
  return inject(NoAuthGuardService).canActivate();
};