import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

import { 
  User, 
  UserResponse, 
  UserStatsResponse,
  UserRequest,
  UserUpdateRequest,
  PasswordChangeRequest,
  UserProfileForm,
  PasswordChangeForm
} from '../../models/call-api/user.model';
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
   * Obtiene el perfil del usuario actual logueado
   */
  getCurrentUserProfile(): Observable<User> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.nickname) {
      return throwError(() => new Error('No hay usuario logueado'));
    }
    
    return this.getUserByNickname(currentUser.nickname);
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
    
    console.log('UserService.updateUser called with:');
    console.log('- nickname:', nickname);
    console.log('- userData:', userData);
    console.log('- headers:', headers.keys());
    
    return this.http.put<any>(`${this.apiUrl}/${nickname}`, userData, { headers })
      .pipe(
        tap(response => {
          console.log('UserService.updateUser success:', response);
        }),
        catchError(error => {
          console.error('UserService.updateUser error:', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  updateCurrentUserProfile(profileData: UserProfileForm): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.nickname) {
      return throwError(() => new Error('No hay usuario logueado'));
    }

    const updateData: UserUpdateRequest = {
      name: profileData.name,
      last_name1: profileData.last_name1,
      last_name2: profileData.last_name2,
      birthdate: profileData.birthdate
    };

    return this.updateUser(currentUser.nickname, updateData);
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
   * Cambia la contraseña del usuario actual
   */
  changeCurrentUserPassword(passwordData: PasswordChangeForm): Observable<any> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.nickname) {
      return throwError(() => new Error('No hay usuario logueado'));
    }

    const changeData: PasswordChangeRequest = {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password
    };

    return this.changePassword(currentUser.nickname, changeData);
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
   * Formatea la fecha para mostrar en el frontend
   */
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return dateString.split('T')[0]; // Obtiene solo la parte de la fecha YYYY-MM-DD
  }

  /**
   * Formatea el nombre completo del usuario
   */
  getFullName(user: User): string {
    let fullName = user.name || '';
    if (user.last_name1) {
      fullName += ` ${user.last_name1}`;
    }
    if (user.last_name2) {
      fullName += ` ${user.last_name2}`;
    }
    return fullName.trim();
  }

  /**
   * Manejo de errores
   */
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.error || error.error?.message || 'Error del servidor';
    }
    console.error('UserService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}