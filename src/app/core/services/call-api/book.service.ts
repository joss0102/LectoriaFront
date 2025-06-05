import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, retry, map, tap } from 'rxjs/operators';

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
  private bookCache = new Map<number, Book>();
  private cacheExpiration = new Map<number, number>();
  private CACHE_TIME = 5 * 60 * 1000; // 5 minutos en milisegundos

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
   * Obtiene un libro por su ID con caché
   */
  getBookByIdWithCache(bookId: number): Observable<Book> {
    // Verificar si el libro está en caché y no ha expirado
    const now = Date.now();
    const cachedExpiration = this.cacheExpiration.get(bookId);
    const cachedBook = this.bookCache.get(bookId);
    
    if (cachedBook && cachedExpiration && cachedExpiration > now) {
      return of(cachedBook);
    }
    
    // Si no está en caché o ha expirado, hacer la solicitud
    return this.getBookById(bookId).pipe(
      tap(book => {
        // Guardar en caché con tiempo de expiración
        this.bookCache.set(bookId, book);
        this.cacheExpiration.set(bookId, now + this.CACHE_TIME);
      })
    );
  }

  /**
   * Obtiene múltiples libros en una sola solicitud
   */
  getBooksInBatch(bookIds: number[]): Observable<Book[]> {
    if (!bookIds || bookIds.length === 0) {
      return of([]);
    }

    // Limitar a 50 libros por solicitud para prevenir problemas
    const limitedIds = bookIds.slice(0, 50);
    
    // Construir los parámetros de la consulta
    const params = new HttpParams().set('ids', limitedIds.join(','));
    
    return this.http.get<{data: Book[]}>(`${this.apiUrl}/batch`, { params })
      .pipe(
        map(response => response.data),
        retry(1),
        catchError(error => {
          console.error('Error al obtener libros en lote, intentando método alternativo:', error);
          // Plan B: Si el endpoint batch falla, hacer solicitudes individuales
          return this.getFallbackBooks(limitedIds);
        })
      );
  }

  /**
   * Obtiene múltiples libros con caché
   */
  getBooksWithCache(bookIds: number[]): Observable<Book[]> {
    if (!bookIds || bookIds.length === 0) {
      return of([]);
    }
    
    const now = Date.now();
    const cachedBooks: Book[] = [];
    const idsToFetch: number[] = [];
    
    // Separar IDs que están en caché de los que necesitan ser solicitados
    bookIds.forEach(id => {
      const cachedExpiration = this.cacheExpiration.get(id);
      const cachedBook = this.bookCache.get(id);
      
      if (cachedBook && cachedExpiration && cachedExpiration > now) {
        cachedBooks.push(cachedBook);
      } else {
        idsToFetch.push(id);
      }
    });
    
    // Si todos están en caché, retornar inmediatamente
    if (idsToFetch.length === 0) {
      return of(cachedBooks);
    }
    
    // Buscar los libros que faltan y combinarlos con los que ya están en caché
    return this.getBooksInBatch(idsToFetch).pipe(
      map(newBooks => {
        // Guardar nuevos libros en caché
        newBooks.forEach(book => {
          if (book && book.book_id) { // Verificar que el libro sea válido
            this.bookCache.set(book.book_id, book);
            this.cacheExpiration.set(book.book_id, now + this.CACHE_TIME);
          }
        });
        
        // Devolver todos los libros (de caché + nuevos)
        return [...cachedBooks, ...newBooks];
      })
    );
  }

  /**
   * Método de respaldo para obtener libros individualmente si el batch falla
   * (Método interno, no para uso directo)
   */
  private getFallbackBooks(bookIds: number[]): Observable<Book[]> {
    if (!bookIds || bookIds.length === 0) {
      return of([]);
    }
    
    // Crear un observable para cada ID de libro
    const observables = bookIds.map(id => this.getBookById(id));
    
    // Combinar todos los observables
    return forkJoin(observables);
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
        tap(() => {
          // Invalidar caché para este libro
          this.bookCache.delete(bookId);
          this.cacheExpiration.delete(bookId);
        }),
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
        tap(() => {
          // Invalidar caché para este libro
          this.bookCache.delete(bookId);
          this.cacheExpiration.delete(bookId);
        }),
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
        tap(() => {
          // Invalidar caché para este libro
          this.bookCache.delete(bookId);
          this.cacheExpiration.delete(bookId);
        }),
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
        tap(() => {
          // Invalidar caché para este libro
          this.bookCache.delete(bookId);
          this.cacheExpiration.delete(bookId);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Limpia toda la caché
   */
  clearCache(): void {
    this.bookCache.clear();
    this.cacheExpiration.clear();
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
    return throwError(() => error);
  }
}