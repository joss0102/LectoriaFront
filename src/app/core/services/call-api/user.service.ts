import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { 
  User, 
  UserResponse, 
  UserStatsResponse,
  UserRequest,
  UserUpdateRequest,
  PasswordChangeRequest
} from '../../models/user.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene todos los usuarios con paginación y búsqueda opcional
   */
  getAllUsers(page: number = 1, pageSize: number = 10, search?: string): Observable<UserResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UserResponse>(this.apiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un usuario por su nickname
   */
  getUserByNickname(nickname: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${nickname}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene estadísticas de lectura de un usuario
   */
  getUserStats(nickname: string): Observable<UserStatsResponse> {
    return this.http.get<UserStatsResponse>(`${this.apiUrl}/${nickname}/stats`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade un nuevo usuario
   */
  addUser(userData: UserRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(nickname: string, userData: UserUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/${nickname}`, userData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cambia la contraseña de un usuario
   */
  changePassword(nickname: string, passwordData: PasswordChangeRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/${nickname}/password`, passwordData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(nickname: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/${nickname}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene usuarios por rol
   */
  getUsersByRole(roleName: string, page: number = 1, pageSize: number = 10): Observable<UserResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<UserResponse>(`${this.apiUrl}/role/${roleName}/users`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todos los roles disponibles
   */
  getAllRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roles`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.error || error.error?.message || 'Error del servidor';
    }
    console.error('UserService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}