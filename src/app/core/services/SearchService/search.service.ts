import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, switchMap, expand, tap, EMPTY } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { BookService } from '../call-api/book.service';
import { AuthorService } from '../call-api/author.service';
import { AuthService } from '../auth/auth.service';

import { Book, UserBookResponse } from '../../models/call-api/book.model';
import { Author } from '../../models/call-api/author.model';

export interface SearchResult {
  id: number;
  name: string;
  type: 'book' | 'author';
  imageUrl?: string;
}

export interface DetailedSearchResult {
  id: number;
  type: 'book' | 'author';
  inUserLibrary: boolean;
  data: Book | Author;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private recentSearches: SearchResult[] = [];
  private maxRecentSearches = 5;

  private selectedItemSubject = new BehaviorSubject<DetailedSearchResult | null>(null);
  public selectedItem$ = this.selectedItemSubject.asObservable();

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private authService: AuthService
  ) {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      this.recentSearches = JSON.parse(savedSearches);
    }
  }

  /**
   * Busca libros y autores que coincidan con el término de búsqueda
   * Búsqueda estricta: solo en títulos de libros y nombres de autores
   */
  search(term: string, page: number = 1, pageSize: number = 10): Observable<SearchResult[]> {
    if (!term || term.trim() === '') {
      return of([]);
    }

    const trimmedTerm = term.trim();
    const booksSearch$ = this.bookService.getAllBooks(page, pageSize, trimmedTerm).pipe(
      catchError(error => {
        console.error('Error en búsqueda de libros:', error);
        return of({ data: [], pagination: { page: 1, page_size: 10, total_items: 0, total_pages: 0 } });
      })
    );
    
    const authorsSearch$ = this.authorService.searchAuthors(trimmedTerm, page, pageSize).pipe(
      catchError(error => {
        console.error('Error en búsqueda de autores:', error);
        return of({ data: [], pagination: { page: 1, page_size: 10, total_items: 0, total_pages: 0 } });
      })
    );

    return forkJoin({
      books: booksSearch$,
      authors: authorsSearch$
    }).pipe(
      map(results => {
        
        const authorResults: SearchResult[] = (results.authors?.data || []).map(author => {
          const fullName = this.getAuthorFullName(author);
          return {
            id: author.id,
            name: fullName,
            type: 'author' as const,
            imageUrl: this.getAuthorImageUrl(author)
          };
        });
        
        const bookResults: SearchResult[] = (results.books?.data || []).map(book => ({
          id: book.book_id,
          name: book.book_title,
          type: 'book' as const,
          imageUrl: this.getBookImageUrl(book)
        }));
        
        const combinedResults = [
          ...authorResults.slice(0, 5),
          ...bookResults.slice(0, 5)
        ];
        
        
        return combinedResults;
      }),
      catchError(error => {
        console.error('Error general en la búsqueda:', error);
        return of([]);
      })
    );
  }

  /**
   * Selecciona un item para ver sus detalles y lo comunica al componente Search
   */
  selectItem(item: SearchResult): void {
    this.addToRecentSearches(item);
    
    if (item.type === 'book') {
      
      this.bookService.getBookByIdWithCache(item.id).pipe(
        tap(bookBasicInfo => {
        }),
        switchMap(bookBasicInfo => {
          return this.checkIfBookInUserLibrary(item.id).pipe(
            map(userBookData => {
              if (userBookData) {
                const combinedData = { ...bookBasicInfo, ...userBookData };
                return {
                  inUserLibrary: true,
                  data: combinedData
                };
              } else {
                return {
                  inUserLibrary: false,
                  data: bookBasicInfo
                };
              }
            })
          );
        })
      ).subscribe(result => {
        this.selectedItemSubject.next({
          id: item.id,
          type: 'book',
          inUserLibrary: result.inUserLibrary,
          data: result.data
        });
      }, error => {
        console.error(' Error al seleccionar libro:', error);
      });
    } else {
      this.authorService.getAuthorById(item.id).subscribe(author => {
        this.selectedItemSubject.next({
          id: item.id,
          type: 'author',
          inUserLibrary: false,
          data: author
        });
      }, error => {
        console.error(' Error al seleccionar autor:', error);
      });
    }
  }

  /**
   * Selecciona un item directamente por ID y tipo
   */
  selectItemById(id: number, type: 'book' | 'author'): void {
    if (type === 'book') {
      
      this.bookService.getBookByIdWithCache(id).pipe(

        switchMap(bookBasicInfo => {
          return this.checkIfBookInUserLibrary(id).pipe(
            map(userBookData => {
              const item: SearchResult = {
                id: bookBasicInfo.book_id,
                name: bookBasicInfo.book_title,
                type: 'book',
                imageUrl: this.getBookImageUrl(bookBasicInfo)
              };
              this.addToRecentSearches(item);
              
              if (userBookData) {
                const combinedData = { ...bookBasicInfo, ...userBookData };
                
                return {
                  inUserLibrary: true,
                  data: combinedData
                };
              } else {
                return {
                  inUserLibrary: false,
                  data: bookBasicInfo
                };
              }
            })
          );
        })
      ).subscribe(result => {
        this.selectedItemSubject.next({
          id: id,
          type: 'book',
          inUserLibrary: result.inUserLibrary,
          data: result.data
        });
      }, error => {
        console.error(' Error al seleccionar libro por ID:', error);
      });
    } else {
      this.authorService.getAuthorById(id).subscribe(author => {
        const item: SearchResult = {
          id: author.id,
          name: this.getAuthorFullName(author),
          type: 'author',
          imageUrl: this.getAuthorImageUrl(author)
        };
        this.addToRecentSearches(item);
        
        this.selectedItemSubject.next({
          id: id,
          type: 'author',
          inUserLibrary: false,
          data: author
        });
      }, error => {
        console.error(' Error al seleccionar autor por ID:', error);
      });
    }
  }

  /**
   * Comprueba si un libro está en la biblioteca del usuario actual
   * buscando en todas las páginas hasta encontrarlo
   * @param bookId ID del libro a comprobar
   * @returns Observable que emite los datos del libro en la biblioteca o null
   */
  private checkIfBookInUserLibrary(bookId: number): Observable<any> {
    const currentUser = this.authService.currentUserValue?.nickname;
    
    if (!currentUser) {
      return of(null);
    }
    const pageSize = 10;
    
    return this.searchInPage(currentUser, bookId, 1, pageSize);
  }
  
  /**
   * Busca un libro en una página específica de la biblioteca del usuario
   * y continúa buscando en las siguientes páginas si no lo encuentra
   */
  private searchInPage(username: string, bookId: number, page: number, pageSize: number): Observable<any> {
    
    return this.bookService.getUserBooks(username, undefined, page, pageSize).pipe(
      map(response => {
        const foundBook = response.data.find(book => book.book_id === bookId);
        
        if (foundBook) {
          return {
            book: foundBook,
            pagination: response.pagination,
            found: true
          };
        } else {
          return {
            book: null,
            pagination: response.pagination,
            found: false
          };
        }
      }),
      expand(result => {
        if (result.found || result.pagination.page >= result.pagination.total_pages) {
          return EMPTY;
        }
        
        return this.bookService.getUserBooks(username, undefined, result.pagination.page + 1, pageSize).pipe(
          map(nextResponse => {
            const nextPageBook = nextResponse.data.find(book => book.book_id === bookId);
            
            if (nextPageBook) {
              return {
                book: nextPageBook,
                pagination: nextResponse.pagination,
                found: true
              };
            } else {
              return {
                book: null,
                pagination: nextResponse.pagination,
                found: false
              };
            }
          })
        );
      }),
      map(result => result.book),
      catchError(error => {
        console.error(` Error al buscar libro #${bookId} en la biblioteca:`, error);
        return of(null);
      })
    );
  }

  /**
   * Añade un elemento a las búsquedas recientes
   */
  private addToRecentSearches(item: SearchResult): void {
    let updatedItem = {...item};
    
    if (item.type === 'book' && (!item.imageUrl || item.imageUrl.includes('placeholder'))) {
      this.bookService.getBookByIdWithCache(item.id).subscribe(book => {
        updatedItem.imageUrl = this.getBookImageUrl(book);
        this.updateRecentSearchInStorage(updatedItem);
      });
    } 
    else if (item.type === 'author' && (!item.imageUrl || item.imageUrl.includes('placeholder'))) {
      this.authorService.getAuthorById(item.id).subscribe(author => {
        updatedItem.imageUrl = this.getAuthorImageUrl(author);
        this.updateRecentSearchInStorage(updatedItem);
      });
    } 
    else {
      this.updateRecentSearchInStorage(updatedItem);
    }
  }

  /**
   * Actualiza la lista de búsquedas recientes en el almacenamiento
   */
  private updateRecentSearchInStorage(item: SearchResult): void {
    const existingIndex = this.recentSearches.findIndex(
      search => search.id === item.id && search.type === item.type
    );
    
    if (existingIndex !== -1) {
      this.recentSearches.splice(existingIndex, 1);
    }
    this.recentSearches.unshift(item);
    
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    }
    
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  /**
   * Obtiene las búsquedas recientes
   */
  getRecentSearches(): SearchResult[] {
    this.recentSearches.forEach(item => {
      if (item.type === 'book' && (!item.imageUrl || item.imageUrl.includes('placeholder'))) {
        this.bookService.getBookByIdWithCache(item.id).subscribe(book => {
          if (book) {
            item.imageUrl = this.getBookImageUrl(book);
            localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
          }
        });
      }
      else if (item.type === 'author' && (!item.imageUrl || item.imageUrl.includes('placeholder'))) {
        this.authorService.getAuthorById(item.id).subscribe(author => {
          if (author) {
            item.imageUrl = this.getAuthorImageUrl(author);
            localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
          }
        });
      }
    });
    
    return [...this.recentSearches];
  }

  /**
   * Limpia las búsquedas recientes
   */
  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  /**
   * Obtiene la ruta completa de la imagen de un autor basado en su nombre y apellidos
   * @param author El objeto autor
   * @returns URL de la imagen del autor
   */
  getAuthorImageUrl(author: Author): string {
    const fullName = this.getAuthorFullName(author);
    return `autores/${fullName}/autor/${fullName}.jpg`;
  }

  /**
   * Obtiene el nombre completo de un autor, incluyendo apellidos si están disponibles
   * @param author El objeto autor
   * @returns Nombre completo del autor
   */
  getAuthorFullName(author: Author): string {
    let fullName = author.name || '';
    
    if (author.last_name1) {
      fullName += ` ${author.last_name1}`;
    }
    
    if (author.last_name2) {
      fullName += ` ${author.last_name2}`;
    }
    
    return fullName.trim();
  }

  /**
   * Obtiene la ruta completa de la imagen de portada de un libro
   * @param book El objeto libro
   * @returns URL de la imagen del libro
   */
  getBookImageUrl(book: Book): string {
    const saga = book.sagas || 'Sin saga';
    return `libros/${saga}/covers/${book.book_title}.png`;
  }
}