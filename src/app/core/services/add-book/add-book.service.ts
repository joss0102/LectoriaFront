import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AddBookModel, BookSearchResult, PaginatedResponse } from '../../models/add-book.model';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddBookService {
  private apiUrl = `${environment.apiUrl}/books`;
  private authorsUrl = `${environment.apiUrl}/authors`;

  constructor(private http: HttpClient) { }

  addBook(book: AddBookModel): Observable<any> {
    return this.http.post<any>(this.apiUrl, book);
  }

  getAllSagas(): Observable<any[]> {
    return this.http.get<PaginatedResponse<BookSearchResult>>(this.apiUrl, {
      params: new HttpParams().set('page_size', '100')
    }).pipe(
      map(response => {
        const sagasMap = new Map();
        
        response.data.forEach(book => {
          if (book.sagas) {
            const sagasList = book.sagas.split(',').map(s => s.trim());
            sagasList.forEach(sagaName => {
              if (sagaName && !sagasMap.has(sagaName)) {
                sagasMap.set(sagaName, {
                  id: sagaName,
                  name: sagaName
                });
              }
            });
          }
        });
        
        return Array.from(sagasMap.values());
      })
    );
  }

  getAllAuthors(page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    return this.http.get<PaginatedResponse<any>>(this.authorsUrl, { params });
  }

  searchAuthors(term: string, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<any>> {
    let params = new HttpParams()
      .set('query', term)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    
    return this.http.get<PaginatedResponse<any>>(`${this.authorsUrl}/search`, { params });
  }

  getAllGenres(): Observable<string[]> {
    return this.http.get<PaginatedResponse<BookSearchResult>>(this.apiUrl, {
      params: new HttpParams().set('page_size', '100')
    }).pipe(
      map(response => {
        const genresSet = new Set<string>();
        
        response.data.forEach(book => {
          if (book.genres) {
            const genresList = book.genres.split(',').map(g => g.trim());
            genresList.forEach(genre => {
              if (genre) {
                genresSet.add(genre);
              }
            });
          }
        });
        
        return Array.from(genresSet).sort();
      })
    );
  }

  addGenres(genres: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/genres`, { genres });
  }

  searchBooks(searchTerm: string, page: number = 1, pageSize: number = 10): Observable<PaginatedResponse<BookSearchResult>> {
    let params = new HttpParams()
      .set('search', searchTerm)
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<PaginatedResponse<BookSearchResult>>(this.apiUrl, { params });
  }

  getBookById(bookId: number): Observable<BookSearchResult> {
    return this.http.get<BookSearchResult>(`${this.apiUrl}/${bookId}`);
  }

  searchBooksOnline(query: string): Observable<any> {
    return this.http.get<any>(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  }
}