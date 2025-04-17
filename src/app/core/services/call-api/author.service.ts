import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { 
  Author, 
  AuthorResponse, 
  AuthorBooksResponse, 
  AuthorSearchResponse,
  AuthorRequest,
  AuthorUpdateRequest
} from '../../models/author.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthorService {
  private apiUrl = environment.apiUrl + '/authors';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene todos los autores
   */
  getAllAuthors(): Observable<AuthorResponse> {
    return this.http.get<AuthorResponse>(this.apiUrl)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un autor por su ID
   */
  getAuthorById(authorId: number): Observable<Author> {
    return this.http.get<Author>(`${this.apiUrl}/${authorId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene los libros de un autor específico
   */
  getAuthorBooks(authorId: number): Observable<AuthorBooksResponse> {
    return this.http.get<AuthorBooksResponse>(`${this.apiUrl}/${authorId}/books`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade un nuevo autor
   */
  addAuthor(authorData: AuthorRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(this.apiUrl, authorData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un autor existente
   */
  updateAuthor(authorId: number, authorData: AuthorUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/${authorId}`, authorData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un autor
   */
  deleteAuthor(authorId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/${authorId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Busca autores por nombre o apellidos
   */
  searchAuthors(query: string, page: number = 1, pageSize: number = 10): Observable<AuthorSearchResponse> {
    let params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<AuthorSearchResponse>(`${this.apiUrl}/search`, { params })
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
    console.error('AuthorService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}