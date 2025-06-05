import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, map, Observable, of, Subscription } from 'rxjs';
import {
  SearchService,
  DetailedSearchResult,
} from '../../../core/services/SearchService/search.service';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';

import { Book, UserBook, BookRequest } from '../../../core/models/call-api/book.model';
import { Author } from '../../../core/models/call-api/author.model';

// Importar la interfaz UserBook del modelo

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  selectedItem: DetailedSearchResult | null = null;
  authorBooks: any[] = [];
  loading: boolean = true;
  error: string | null = null;
  isAddingToLibrary: boolean = false;

  private searchSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private searchService: SearchService,
    private bookService: BookService,
    private authorService: AuthorService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Escuchar cambios de navegación para resetear el estado cuando se sale del componente
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && !event.url.includes('/search')) {
        // Si estamos navegando fuera de la página de búsqueda
        this.searchService.resetSelectedItem();
      }
    });

    // Verificar si hay parámetros en la URL para cargar directamente
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      const type = params['type'];

      if (id && (type === 'book' || type === 'author')) {
        // Siempre seleccionar explícitamente el ítem, incluso si venimos de otra página
        this.searchService.selectItemById(parseInt(id), type);
      }
    });

    this.searchSubscription = this.searchService.selectedItem$.subscribe(
      (item) => {
        this.selectedItem = item;
        this.loading = false;

        if (item) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { id: item.id, type: item.type },
            queryParamsHandling: 'merge',
          });

          if (item.type === 'author') {
            this.loadAuthorBooks(item.id);
          }
        }
      },
      (error) => {
        console.error('Error al cargar el ítem seleccionado:', error);
        this.error =
          'No se pudo cargar la información. Por favor, inténtalo de nuevo.';
        this.loading = false;
      }
    );
  }

  /**
   * Carga los libros de un autor
   */
  loadAuthorBooks(authorId: number) {
    this.authorService.getAuthorBooks(authorId).subscribe(
      (response) => {
        this.authorBooks = response.data;
      },
      (error) => {
        console.error('Error al cargar los libros del autor:', error);
      }
    );
  }

  /**
   * Verifica si un ítem es un libro
   */
  isBook(item: any): boolean {
    return item && 'book_id' in item;
  }

  /**
   * Verifica si un ítem es un autor
   */
  isAuthor(item: any): boolean {
    return item && 'id' in item && !('book_id' in item);
  }

  /**
   * Verifica si un libro está en la biblioteca del usuario
   */
  isInUserLibrary(): boolean {
    const result = this.selectedItem?.inUserLibrary || false;
    return result;
  }

  /**
   * Obtiene el libro seleccionado
   */
  getBook(): UserBook {
    const book = this.selectedItem?.data as UserBook;
    return book;
  }

  /**
   * Obtiene el autor seleccionado
   */
  getAuthor(): Author {
    return this.selectedItem?.data as Author;
  }

  /**
   * Obtiene la URL de la imagen del libro seleccionado
   */
  getBookImageUrl(): string {
    const book = this.getBook();
    if (book) {
      const url = this.searchService.getBookImageUrl(book);
      return url;
    }
    return '/assets/images/book-placeholder.jpg';
  }

  /**
   * Obtiene la URL de la imagen del autor seleccionado
   */
  getAuthorImageUrl(): string {
    const author = this.getAuthor();
    return author
      ? this.searchService.getAuthorImageUrl(author)
      : '/assets/images/author-placeholder.jpg';
  }

  /**
   * Obtiene la URL de la portada para un libro de la lista de libros de un autor
   */
  getBookCoverUrl(bookId: number): Observable<string> {
    return this.bookService.getBookByIdWithCache(bookId).pipe(
      map((book: any) => this.searchService.getBookImageUrl(book)),
      catchError((error) => {
        console.error('Error al obtener el libro:', error);
        return of('libros/default.png');
      })
    );
  }

  /**
   * Obtiene el estado de lectura para mostrar la clase correcta
   */
  getReadingStatusClass(): string {
    const status = this.getBook()?.reading_status;
    if (status === 'reading') return 'badge bg-success';
    if (status === 'pending') return 'badge bg-warning';
    if (status === 'finished') return 'badge bg-primary';
    return 'badge bg-secondary';
  }

  /**
   * Obtiene el texto del estado de lectura
   */
  getReadingStatusText(): string {
    const status = this.getBook()?.reading_status;
    if (status === 'reading') return 'Leyendo';
    if (status === 'plan_to_read') return 'Pendiente';
    if (status === 'completed') return 'Leído';
    if (status === 'dropped') return 'Abandonado';
    if (status === 'on_hold') return 'Pausado';
    return 'Estado desconocido';
  }

  /**
   * Navega a la página de detalles de un libro desde la lista de libros de un autor
   */
  goToBookDetails(bookId: number) {
    this.searchService.selectItemById(bookId, 'book');
  }

  /**
   * Vuelve a la página anterior
   */
  goBack() {
    window.history.back();
  }

/**
 * Añade el libro actual a la biblioteca del usuario
 */
addToLibrary() {
  // Verificar que hay un usuario logueado
  const currentUser = this.authService.currentUserValue;
  if (!currentUser) {
    this.error = 'Debes iniciar sesión para añadir libros a tu biblioteca';
    return;
  }

  // Verificar que hay un libro seleccionado
  if (!this.selectedItem || this.selectedItem.type !== 'book') {
    this.error = 'No hay un libro seleccionado';
    return;
  }

  // Verificar que el libro no está ya en la biblioteca
  if (this.isInUserLibrary()) {
    this.error = 'Este libro ya está en tu biblioteca';
    return;
  }

  this.isAddingToLibrary = true;
  this.error = null;

  const book = this.getBook();
  const userNickname = currentUser.nickname;


  // Usar addBook para crear la relación inicial entre usuario y libro
  const bookRequest: import('../../../core/models/call-api/book.model').BookRequest = {
    title: book.book_title,
    pages: book.book_pages,
    synopsis: book.synopsis || '',
    author_name: this.extractAuthorName(book.authors || ''),
    author_last_name1: this.extractAuthorLastName1(book.authors || ''),
    author_last_name2: this.extractAuthorLastName2(book.authors || ''),
    genre1: this.extractGenre(book.genres || '', 0),
    genre2: this.extractGenre(book.genres || '', 1),
    genre3: this.extractGenre(book.genres || '', 2),
    genre4: this.extractGenre(book.genres || '', 3),
    genre5: this.extractGenre(book.genres || '', 4),
    saga_name: book.sagas || '',
    user_nickname: userNickname,
    status: 'plan_to_read',
    date_added: new Date().toISOString().split('T')[0],
    custom_description: '',
    review: '',
    phrases: '',
    notes: ''
  };


  // Usar el método addBook del BookService
  this.bookService.addBook(bookRequest)
    .subscribe({
      next: (response) => {
        
        // Limpiar la caché del servicio de libros
        this.bookService.clearCache();
        
        // Redirigir al usuario a su biblioteca
        this.router.navigate(['/library']);
      },
      error: (httpError) => {

        
        // Si el error es 409 (conflicto) significa que el libro ya está en la biblioteca
        // En este caso también redirigimos a la biblioteca
        if (httpError.status === 409) {
          this.router.navigate(['/library']);
          return;
        }
        
        // Si el error es 500 (Internal Server Error) pero el libro se añadió correctamente
        // (esto puede pasar en algunos casos donde la operación es exitosa pero hay un error en la respuesta)
        if (httpError.status === 500) {
          // En este caso, redirigir a la biblioteca para que el usuario vea si el libro se añadió
          this.router.navigate(['/library']);
          return;
        }
        
        let errorMessage = 'Error al añadir el libro a la biblioteca.';
        
        if (httpError.status === 404) {
          errorMessage = 'No se encontró el usuario especificado.';
        } else if (httpError.status === 401) {
          errorMessage = 'No tienes permisos para realizar esta acción.';
        } else if (httpError.status === 400) {
          errorMessage = 'Datos inválidos. Verifica la información del libro.';
        } else if (httpError.error && httpError.error.error) {
          errorMessage = httpError.error.error;
        } else if (httpError.message) {
          errorMessage = httpError.message;
        }
        
        this.error = errorMessage;
        this.isAddingToLibrary = false;
      }
    });
}

  /**
   * Extrae el nombre del autor de una cadena de autores
   */
  private extractAuthorName(authors: string): string {
    const parts = authors.split(' ').filter(part => part.trim() !== '');
    return parts[0] || '';
  }

  /**
   * Extrae el primer apellido del autor
   */
  private extractAuthorLastName1(authors: string): string {
    const parts = authors.split(' ').filter(part => part.trim() !== '');
    return parts[1] || '';
  }

  /**
   * Extrae el segundo apellido del autor
   */
  private extractAuthorLastName2(authors: string): string {
    const parts = authors.split(' ').filter(part => part.trim() !== '');
    return parts.slice(2).join(' ') || '';
  }

  /**
   * Extrae un género específico por índice
   */
  private extractGenre(genres: string, index: number): string {
    if (!genres) return '';
    const genreList = genres.split(',').map(g => g.trim()).filter(g => g !== '');
    return genreList[index] || '';
  }

  /**
   * Verifica si el usuario está logueado
   */
  isUserLoggedIn(): boolean {
    return !!this.authService.currentUserValue;
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Asegurarse de limpiar el estado al salir del componente
    this.searchService.resetSelectedItem();
  }
}