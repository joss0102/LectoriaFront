import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { User, LoginRequest, AuthResponse, RefreshResponse } from '../../models/auth.model';
import { Router } from '@angular/router';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private Url = environment.apiUrl + '/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  constructor(private http: HttpClient, private router: Router) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Iniciar sesión
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.Url}/login`, loginData)
      .pipe(
        tap(response => {
          // Guardar tokens y usuario en localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          
          // Actualizar el BehaviorSubject con el usuario actual
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => new Error(error?.error?.error || 'Error en el inicio de sesión'));
        })
      );
  }

  // Cerrar sesión
  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    const headers = this.getAuthHeaders();
    
    // Primero, llamar al endpoint de logout si hay un token
    if (this.isLoggedIn()) {
      return this.http.post(`${this.Url}/logout`, { refresh_token: refreshToken }, { headers })
        .pipe(
          tap(() => this.clearSession()),
          catchError(error => {
            console.error('Error en logout:', error);
            this.clearSession();
            return throwError(() => new Error('Error al cerrar sesión'));
          })
        );
    } else {
      // Si no hay sesión, simplemente limpiar y devolver observable
      this.clearSession();
      return new Observable(observer => {
        observer.next({ message: 'Sesión cerrada' });
        observer.complete();
      });
    }
  }

  // Refrescar token
  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No hay token de refresco disponible'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.http.post<RefreshResponse>(`${this.Url}/refresh`, {}, { headers })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.error('Error al refrescar token:', error);
          // Si falla el refresh, forzamos logout
          this.clearSession();
          return throwError(() => new Error('Sesión expirada, por favor inicie sesión nuevamente'));
        })
      );
  }

  // Verificar si el token actual es válido
  verifyToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get(`${this.Url}/verify`, { headers })
      .pipe(
        catchError(error => {
          if (error.status === 401) {
            // Token inválido, refrescar
            return this.refreshToken();
          }
          return throwError(() => error);
        })
      );
  }

  // Verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  // Obtener headers de autenticación
  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Limpiar sesión
  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}