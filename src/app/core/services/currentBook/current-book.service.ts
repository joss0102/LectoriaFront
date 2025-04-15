import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, map, tap, of, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Books,ReadingRecord } from '../../models/books.model';
import { AuthService } from '../auth/auth.service';

interface PaginatedResponse {
  data: any[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CurrentBookService {
  private apiUrl = `${environment.apiUrl}`;
  
  private currentBookSubject = new BehaviorSubject<Books | null>(null);
  public currentBook$ = this.currentBookSubject.asObservable();
  
  private booksInProgressSubject = new BehaviorSubject<Books[]>([]);
  public booksInProgress$ = this.booksInProgressSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadBooksInProgress();
  }

  loadBooksInProgress(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('Usuario no autenticado');
      return;
    }
    const user = this.authService.currentUserValue;
    if (!user) {
      console.log('No hay información de usuario');
      return;
    }
    const headers = this.authService.getAuthHeaders();
    
    const url = `${this.apiUrl}/books/user/${user.nickname}`;
    
    this.http.get<any>(
      url,
      { 
        headers,
        params: new HttpParams().set('status', 'reading') 
      }
    ).pipe(
      tap(response => {
      }),
      map(response => {
        if (response && response.data) {
          return this.transformBooksData(response.data);
        }
        return [];
      }),
      tap(books => {
        this.booksInProgressSubject.next(books);
        if (books.length > 0 && !this.currentBookSubject.value) {
          this.setCurrentBook(books[0]);
        }
      }),
      catchError(error => {
        console.error('Error cargando libros en progreso:', error);
        return of([]);
      })
    ).subscribe();
  }

  private transformBooksData(booksData: any[]): Books[] {
    return booksData.map(book => {
      let generos: string[] = [];
      if (book.genres) {
        generos = book.genres.split(',').map((g: string) => g.trim());
      } else {

      }
      
      const transformedBook = {
        id: book.book_id,
        titulo: book.book_title || '',
        autor: book.authors || '',
        generos: generos,
        paginasTotales: book.total_pages || 0,
        paginasLeidas: book.pages_read || 0,
        progreso: book.progress_percentage || 0,
        sinopsis: book.synopsis || '',
      
        estado: this.mapStatusToFrontend(book.reading_status || 'reading'),
        fechaInicio: book.date_start ? new Date(book.date_start) : null,
        fechaFin: book.date_ending ? new Date(book.date_ending) : null,
        anotaciones: [],
        frases: [],
        saga: book.sagas || '',
        registroLectura: [],
        descripcionPersonal: book.custom_description || ''
      };
      
      return transformedBook;
    });
  }
  private mapStatusToFrontend(status: string): string {
    switch (status) {
      case 'plan_to_read': return 'no-iniciado';
      case 'reading': return 'en-progreso';
      case 'completed': return 'finalizado';
      case 'dropped': return 'abandonado';
      case 'on_hold': return 'pausado';
      default: return status;
    }
  }

  setCurrentBook(book: Books): void {
    
    this.currentBookSubject.next(book);
    
    this.loadBookDetails(book);
  }

  private loadBookDetails(book: Books): void {
    if (!this.authService.isLoggedIn() || !book) {
      return;
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      return;
    }
    const headers = this.authService.getAuthHeaders();
    
    const bookDetailUrl = `${this.apiUrl}/books/${book.id}`;
    const progressUrl = `${this.apiUrl}/readings/progress/${user.nickname}`;
    const notesUrl = `${this.apiUrl}/readings/notes`;
    const phrasesUrl = `${this.apiUrl}/readings/phrases`;
    
    this.http.get<any>(
      bookDetailUrl,
      { headers }
    ).pipe(
      tap(bookData => {
        if (bookData) {
          if (bookData.synopsis) book.sinopsis = bookData.synopsis;
          if (bookData.authors) book.autor = bookData.authors;
          if (bookData.genres) {
            book.generos = bookData.genres.split(',').map((g: string) => g.trim());
          }
          if (bookData.sagas) book.saga = bookData.sagas;
          
          this.currentBookSubject.next({...book});
        }
      }),
      catchError(error => {
        console.error('Error obteniendo datos completos del libro:', error);
        return of(null);
      })
    ).subscribe();
    
    const progressObs = this.http.get<any>(
      progressUrl,
      { 
        headers,
        params: new HttpParams().set('book_title', book.titulo) 
      }
    ).pipe(
      tap(response => {

      }),
      map(response => {
        if (response && response.data) {
          return this.transformProgressData(response.data);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error cargando progreso:', error);
        return of([]);
      })
    );
    
    const notesObs = this.http.get<any>(
      notesUrl,
      { 
        headers,
        params: new HttpParams()
          .set('book_title', book.titulo)
          .set('user_nickname', user.nickname) 
      }
    ).pipe(
      tap(response => {

      }),
      map(response => {
        if (response && response.data) {
          return this.extractNotesFromResponse(response.data);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error cargando notas:', error);
        return of([]);
      })
    );
    const phrasesObs = this.http.get<any>(
      phrasesUrl,
      { 
        headers,
        params: new HttpParams()
          .set('book_title', book.titulo)
          .set('user_nickname', user.nickname)
      }
    ).pipe(
      tap(response => {
        
      }),
      map(response => {
        if (response && response.data) {
          return this.extractPhrasesFromResponse(response.data);
        }
        return [];
      }),
      catchError(error => {
        console.error('Error cargando frases:', error);
        return of([]);
      })
    );
    
    forkJoin({
      progress: progressObs,
      notes: notesObs,
      phrases: phrasesObs
    }).pipe(
      tap(results => {
        
        const updatedBook: Books = {
          ...book,
          registroLectura: results.progress,
          anotaciones: results.notes,
          frases: results.phrases
        };
        this.currentBookSubject.next(updatedBook);
      })
    ).subscribe();
  }
  private transformProgressData(progressData: any[]): ReadingRecord[] {
    const records = progressData.map(progress => {
      
      return {
        id: progress.progress_id,
        fecha: new Date(progress.reading_date),
        paginasLeidas: progress.pages_read_session,
      };
    });
    
    return records;
  }
  private extractNotesFromResponse(notesData: any[]): string[] {
    const notes = notesData.map(note => note.text || '').filter(text => text.trim() !== '');
    return notes;
  }
  private extractPhrasesFromResponse(phrasesData: any[]): string[] {
    const phrases = phrasesData.map(phrase => phrase.text || '').filter(text => text.trim() !== '');

    return phrases;
  }
  updateReadingProgress(bookId: number, pages: number, date: string): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return of(null);
    }
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(null);
    }
    const headers = this.authService.getAuthHeaders();
    
    const body = {
      nickname: user.nickname,
      book_title: this.currentBookSubject.value?.titulo,
      pages_read_list: pages.toString(),
      dates_list: date
    };
    
    
    return this.http.post(
      `${this.apiUrl}/readings/progress`,
      body,
      { headers }
    ).pipe(
      tap(response => {
        if (this.currentBookSubject.value) {
          this.loadBookDetails(this.currentBookSubject.value);
        }
      }),
      catchError(error => {
        console.error('Error actualizando progreso de lectura:', error);
        return of(null);
      })
    );
  }
  updateBookStatus(bookId: number, status: string): Observable<any> {
    if (!this.authService.isLoggedIn()) {
      return of(null);
    }
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(null);
    }
    const headers = this.authService.getAuthHeaders();
    
    const backendStatus = this.mapStatusToBackend(status);
    
    const body = {
      status: backendStatus
    };
    
    console.log('Enviando actualización de estado:', body);
    
    return this.http.put(
      `${this.apiUrl}/books/user/${user.nickname}/book/${bookId}`,
      body,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Respuesta de actualización de estado:', response);
        this.loadBooksInProgress();
      }),
      catchError(error => {
        console.error('Error actualizando estado del libro:', error);
        return of(null);
      })
    );
  }
  private mapStatusToBackend(status: string): string {
    switch (status) {
      case 'no-iniciado': return 'plan_to_read';
      case 'en-progreso': return 'reading';
      case 'finalizado': return 'completed';
      case 'abandonado': return 'dropped';
      case 'pausado': return 'on_hold';
      default: return status;
    }
  }
  addOrUpdateNote(text: string): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.currentBookSubject.value) {
      return of(null);
    }

    const user = this.authService.currentUserValue;
    if (!user) {
      return of(null);
    }

    const headers = this.authService.getAuthHeaders();
    
    const body = {
      user_nickname: user.nickname,
      book_title: this.currentBookSubject.value.titulo,
      text: text
    };
    
    
    return this.http.post(
      `${this.apiUrl}/readings/notes`,
      body,
      { headers }
    ).pipe(
      tap(response => {
        const currentBook = this.currentBookSubject.value;
        if (currentBook) {
          const updatedNotes = [...(currentBook.anotaciones || []), text];
          const updatedBook = {...currentBook, anotaciones: updatedNotes};
          this.currentBookSubject.next(updatedBook);
        }
      }),
      catchError(error => {
        console.error('Error añadiendo/actualizando nota:', error);
        return of(null);
      })
    );
  }
  addQuote(text: string): Observable<any> {
    if (!this.authService.isLoggedIn() || !this.currentBookSubject.value) {
      return of(null);
    }
    const user = this.authService.currentUserValue;
    if (!user) {
      return of(null);
    }
    const headers = this.authService.getAuthHeaders();
    const body = {
      user_nickname: user.nickname,
      book_title: this.currentBookSubject.value.titulo,
      text: text
    };
    
    
    return this.http.post(
      `${this.apiUrl}/readings/phrases`,
      body,
      { headers }
    ).pipe(
      tap(response => {
        const currentBook = this.currentBookSubject.value;
        if (currentBook) {
          const updatedQuotes = [...(currentBook.frases || []), text];
          const updatedBook = {...currentBook, frases: updatedQuotes};
          this.currentBookSubject.next(updatedBook);
        }
      }),
      catchError(error => {
        console.error('Error añadiendo frase destacada:', error);
        return of(null);
      })
    );
  }
}