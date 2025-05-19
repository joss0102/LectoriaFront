import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  ChatData, 
  ChatMessage, 
  DailyReadingStats,
  ReadingProgress
} from '../../models/call-api/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Obtiene todos los datos necesarios para el chat
   */
  getChatData(nickname: string): Observable<ChatData> {
    return this.http.get<ChatData>(`${this.apiUrl}/${nickname}/data`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene los mensajes de chat
   */
  getChatMessages(nickname: string, limit: number = 20, offset: number = 0): Observable<{ messages: ChatMessage[] }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get<{ messages: ChatMessage[] }>(`${this.apiUrl}/${nickname}/messages`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene el historial de lectura detallado
   */
  getReadingHistory(nickname: string, bookId?: number, startDate?: string, endDate?: string, limit: number = 50, offset: number = 0): Observable<{ data: ReadingProgress[], pagination: any }> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    if (bookId) {
      params = params.set('book_id', bookId.toString());
    }
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }

    return this.http.get<{ data: ReadingProgress[], pagination: any }>(`${this.apiUrl}/${nickname}/reading-history`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Obtiene estadísticas de lectura diaria
   */
  getDailyReadingStats(nickname: string, days: number = 30): Observable<{ daily_stats: DailyReadingStats[] }> {
    let params = new HttpParams()
      .set('days', days.toString());

    return this.http.get<{ daily_stats: DailyReadingStats[] }>(`${this.apiUrl}/${nickname}/daily-stats`, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Procesa una consulta de chat y devuelve la respuesta
   */
  processQuery(query: string, user: string): Observable<any> {
    const token = localStorage.getItem('access_token');
    
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
      
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return this.http.post<any>(
      `${this.apiUrl}/query`, 
      { query, user },
      { headers }
    ).pipe(
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
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.error || error.error?.message || 'Error del servidor';
    }
    console.error('ChatService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}