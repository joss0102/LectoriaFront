import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { 
  ReadingProgressResponse,
  ReviewResponse,
  PhraseResponse,
  NoteResponse,
  ReadingProgressRequest,
  ReadingProgressUpdateRequest,
  ReviewRequest,
  ReviewUpdateRequest,
  PhraseRequest,
  NoteRequest
} from '../../models/call-api/reading.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReadingService {
  private apiUrl = environment.apiUrl + '/readings';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Obtiene el progreso de lectura de un usuario
   */
  getReadingProgress(userNickname: string, bookTitle?: string, page: number = 1, pageSize: number = 10): Observable<ReadingProgressResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (bookTitle) {
      params = params.set('book_title', bookTitle);
    }

    return this.http.get<ReadingProgressResponse>(`${this.apiUrl}/progress/${userNickname}`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade progreso de lectura para un usuario y un libro
   */
  addReadingProgress(progressData: ReadingProgressRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/progress`, progressData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza un registro de progreso de lectura existente
   */
  updateReadingProgress(progressId: number, progressData: ReadingProgressUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/progress/${progressId}`, progressData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina el progreso de lectura de un libro específico para un usuario
   */
  deleteReadingProgress(userNickname: string, bookId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/progress/${userNickname}/book/${bookId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene reseñas de libros con paginación
   */
  getBookReviews(bookTitle?: string, userNickname?: string, page: number = 1, pageSize: number = 10): Observable<ReviewResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (bookTitle) {
      params = params.set('book_title', bookTitle);
    }
    if (userNickname) {
      params = params.set('user_nickname', userNickname);
    }

    return this.http.get<ReviewResponse>(`${this.apiUrl}/reviews`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene una reseña específica por su ID
   */
  getReviewById(reviewId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reviews/${reviewId}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade una nueva reseña para un libro
   */
  addReview(reviewData: ReviewRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/reviews`, reviewData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una reseña existente
   */
  updateReview(reviewId: number, reviewData: ReviewUpdateRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/reviews/${reviewId}`, reviewData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una reseña
   */
  deleteReview(reviewId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/reviews/${reviewId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene estadísticas de lectura para un usuario
   */
  getUserReadingStats(userNickname: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats/${userNickname}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene frases destacadas con paginación
   */
  getPhrases(bookTitle?: string, userNickname?: string, page: number = 1, pageSize: number = 10): Observable<PhraseResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (bookTitle) {
      params = params.set('book_title', bookTitle);
    }
    if (userNickname) {
      params = params.set('user_nickname', userNickname);
    }

    return this.http.get<PhraseResponse>(`${this.apiUrl}/phrases`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade una nueva frase destacada para un libro
   */
  addPhrase(phraseData: PhraseRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/phrases`, phraseData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una frase destacada existente
   */
  updatePhrase(phraseId: number, phraseData: { text: string }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/phrases/${phraseId}`, phraseData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una frase destacada
   */
  deletePhrase(phraseId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/phrases/${phraseId}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene notas de libros con paginación
   */
  getNotes(bookTitle?: string, userNickname?: string, page: number = 1, pageSize: number = 10): Observable<NoteResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (bookTitle) {
      params = params.set('book_title', bookTitle);
    }
    if (userNickname) {
      params = params.set('user_nickname', userNickname);
    }

    return this.http.get<NoteResponse>(`${this.apiUrl}/notes`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Añade una nueva nota para un libro
   */
  addNote(noteData: NoteRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.post<any>(`${this.apiUrl}/notes`, noteData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualiza una nota existente
   */
  updateNote(noteId: number, noteData: { text: string }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.put<any>(`${this.apiUrl}/notes/${noteId}`, noteData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Elimina una nota
   */
  deleteNote(noteId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.delete<any>(`${this.apiUrl}/notes/${noteId}`, { headers })
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
    console.error('ReadingService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}