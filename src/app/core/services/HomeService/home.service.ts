import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, of, mergeMap, catchError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { HomeModel, PaginationResponse } from '../../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiUrl}/books`;

  // Creamos el BehaviorSubject para el libro actual
  private currentBookSubject = new BehaviorSubject<HomeModel | null>(null);

  // Observable para que otros se puedan suscribir
  currentBook$ = this.currentBookSubject.asObservable();

  constructor(private http: HttpClient) {}

  getBooksPage(page: number = 1, pageSize: number = 10): Observable<PaginationResponse<HomeModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<PaginationResponse<HomeModel>>(this.apiUrl, { params });
  }

  getBooks(page: number = 1, pageSize: number = 10): Observable<HomeModel[]> {
    return this.getBooksPage(page, pageSize).pipe(
      map(response => response.data)
    );
  }

  getAllBooks(): Observable<HomeModel[]> {
    const pageSize = 100;
    return this.getBooksPage(1, pageSize).pipe(
      mergeMap(firstResponse => {
        const totalItems = firstResponse.pagination.total_items;
        const totalPages = firstResponse.pagination.total_pages;

        if (totalPages <= 1) {
          return of(firstResponse.data);
        }

        const requests: Observable<HomeModel[]>[] = [of(firstResponse.data)];

        for (let page = 2; page <= totalPages; page++) {
          requests.push(
            this.getBooksPage(page, pageSize).pipe(
              map(response => response.data),
              catchError(error => {
                console.error(`Error al obtener la página ${page}:`, error);
                return of([]);
              })
            )
          );
        }

        return forkJoin(requests).pipe(
          map(results => results.flat())
        );
      })
    );
  }

  getBooksForCarousel(limit: number = 0): Observable<HomeModel[]> {
    return this.getAllBooks().pipe(
      map(books => {
        // Crear una copia del array antes de modificarlo
        const allBooks = [...books];
        
        // Aplicar Fisher-Yates shuffle para mezclar los libros aleatoriamente
        for (let i = allBooks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allBooks[i], allBooks[j]] = [allBooks[j], allBooks[i]];
        }
        
        // Devolver todos los libros mezclados o solo hasta el límite si se especifica
        if (limit <= 0 || limit >= allBooks.length) {
          return allBooks;
        }
        return allBooks.slice(0, limit);
      })
    );
  }

  /**
   * Actualiza el libro actual seleccionado
   * @param book Libro seleccionado
   */
  actualizarBookActual(book: HomeModel): void {
    this.currentBookSubject.next(book);
  }

  /**
   * Obtiene el libro actualmente seleccionado como valor sincrónico
   * @returns El libro actual o null
   */
  getBookActual(): HomeModel | null {
    return this.currentBookSubject.getValue();
  }
}