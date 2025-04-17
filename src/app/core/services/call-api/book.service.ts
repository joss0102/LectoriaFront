import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { 
  Book, 
  BookResponse, 
  UserBookResponse, 
  BookRequest, 
  BookUpdateRequest,
  UserBookUpdateRequest
} from '../../models/call-api/book.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = environment.apiUrl + '/books';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene todos los libros con paginación y filtros opcionales
   */
  getAllBooks(page: number = 1, pageSize: number = 10, search?: string, genre?: string, author?: string): Observable<BookResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (genre) {
      params = params.set('genre', genre);
    }
    if (author) {
      params = params.set('author', author);
    }

    return this.http.get<BookResponse>(this.apiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene un libro por su ID
   */
  getBookById(bookId: number): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${bookId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade un nuevo libro
   */
  addBook(bookData: BookRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(this.apiUrl, bookData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un libro existente
   */
  updateBook(bookId: number, bookData: BookUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/${bookId}`, bookData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un libro
   */
  deleteBook(bookId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/${bookId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene todos los libros de un usuario específico
   */
  getUserBooks(nickname: string, status?: string, page: number = 1, pageSize: number = 10): Observable<UserBookResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<UserBookResponse>(`${this.apiUrl}/user/${nickname}`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza la relación entre un usuario y un libro
   */
  updateUserBookRelationship(nickname: string, bookId: number, data: UserBookUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/user/${nickname}/book/${bookId}`, data, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina un libro de la colección del usuario
   */
  removeBookFromUser(nickname: string, bookId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/user/${nickname}/book/${bookId}`, { headers })
      .pipe(
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
    console.error('BookService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}