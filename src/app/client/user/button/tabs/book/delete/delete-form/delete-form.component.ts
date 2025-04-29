import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../../../../../core/services/call-api/book.service';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';
import { UserBook } from '../../../../../../../core/models/call-api/book.model';
import { catchError, finalize, of, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-delete-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-form.component.html',
  styleUrl: './delete-form.component.scss'
})
export class DeleteFormComponent implements OnInit, OnDestroy {
  allBooks: UserBook[] = [];
  filteredBooks: UserBook[] = [];
  displayedBooks: UserBook[] = [];
  selectedBookToDelete: UserBook | null = null;
  isDeleteModalOpen: boolean = false;
  searchQuery: string = '';
  private readonly pageSize: number = 14;
  private currentPage: number = 1;
  loading: boolean = false;
  private destroy$ = new Subject<void>();
  
  // Variables para paginación de API
  currentApiPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  hasMoreBooks: boolean = false;

  constructor(
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserBooks(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Carga los libros del usuario actual desde la API con paginación */
  loadUserBooks(page: number = 1, keepExisting: boolean = false): void {
    this.loading = true;
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.loading = false;
      return;
    }

    this.bookService.getUserBooks(currentUser.nickname, undefined, page, 30)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al cargar los libros:', error);
          this.loading = false;
          throw error;
        })
      )
      .subscribe(response => {
        
        if (response && response.data) {
          const bookIds = response.data.map(book => book.book_id);
          this.bookService.getBooksWithCache(bookIds)
            .pipe(
              catchError(error => {
                console.error('Error al obtener detalles de libros en batch:', error);
                return of([]);
              }),
              finalize(() => this.loading = false)
            )
            .subscribe(detailedBooks => {
              const detailsMap = new Map<number, any>();
              detailedBooks.forEach(book => {
                if (book && book.book_id) {
                  detailsMap.set(book.book_id, book);
                }
              });
              
              const enrichedBooks: UserBook[] = response.data.map(book => {
                const details = detailsMap.get(book.book_id);
                
                return {
                  ...book,
                  authors: details && details.authors ? details.authors : (book.authors || 'Autor desconocido'),
                  sagas: details && details.sagas ? details.sagas : (book.sagas || ''),
                  synopsis: details && details.synopsis ? details.synopsis : (book.synopsis || 'No hay sinopsis disponible'),
                  book_pages: details && details.book_pages ? details.book_pages : (book.book_pages || 0),
                  genres: details && details.genres ? details.genres : (book.genres || '')
                };
              });
              
              if (page === 1 || !keepExisting) {
                this.allBooks = enrichedBooks;
                this.totalPages = response.pagination.total_pages;
                this.totalItems = response.pagination.total_items;
                this.currentApiPage = 1;
              } else {
                this.allBooks = [...this.allBooks, ...enrichedBooks];
                this.currentApiPage = page;
              }
              
              this.filteredBooks = [...this.allBooks];
              this.resetPagination();
              
              this.hasMoreBooks = (this.displayedBooks.length < this.filteredBooks.length) || 
                                  (this.currentApiPage < this.totalPages);
            });
        } else {
          console.error('Formato de respuesta inesperado:', response);
          this.loading = false;
        }
      });
  }

  /** Carga más libros para la paginación interna */
  loadMoreBooks(): void {
    this.currentPage++;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    if (endIndex >= this.filteredBooks.length && this.currentApiPage < this.totalPages) {
      this.loadMoreBooksFromApi();
      return;
    }
    
    const newBooks = this.filteredBooks.slice(startIndex, endIndex);
    this.displayedBooks = [...this.displayedBooks, ...newBooks];
    
    this.hasMoreBooks = (this.displayedBooks.length < this.filteredBooks.length) || 
                          (this.currentApiPage < this.totalPages);
  }
  
  /** Carga más libros desde la API cuando llegamos al límite local */
  loadMoreBooksFromApi(): void {
    const nextPage = this.currentApiPage + 1;
    if (nextPage <= this.totalPages) {
      this.loadUserBooks(nextPage, true);
    }
  }

  /** Resetea la paginación al primer grupo de libros */
  resetPagination(): void {
    this.currentPage = 1;
    this.displayedBooks = this.filteredBooks.slice(0, this.pageSize);
    
    this.hasMoreBooks = (this.displayedBooks.length < this.filteredBooks.length) || 
                          (this.currentApiPage < this.totalPages);
  }

  /** Filtra libros según el término de búsqueda */
  searchBooks(): void {
    this.currentApiPage = 1;
    this.currentPage = 1;
    
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.loadUserBooks(1);
      return;
    }
    
    this.loading = true;
    const query = this.searchQuery.toLowerCase().trim();
    
    this.performLocalSearch(query);
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.loading = false;
      return;
    }
    
    this.bookService.getUserBooks(currentUser.nickname, undefined, 1, 100)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al buscar libros:', error);
          this.loading = false;
          throw error;
        })
      )
      .subscribe(response => {
        
        if (response && response.data) {
          const bookIds = response.data.map(book => book.book_id);
          
          this.bookService.getBooksWithCache(bookIds)
            .pipe(
              catchError(error => {
                console.error('Error al obtener detalles en búsqueda:', error);
                return of([]);
              }),
              finalize(() => this.loading = false)
            )
            .subscribe(detailedBooks => {
              const detailsMap = new Map<number, any>();
              detailedBooks.forEach(book => {
                if (book && book.book_id) {
                  detailsMap.set(book.book_id, book);
                }
              });
              
              const enrichedBooks: UserBook[] = response.data.map(book => {
                const details = detailsMap.get(book.book_id);
                
                return {
                  ...book,
                  authors: details && details.authors ? details.authors : (book.authors || 'Autor desconocido'),
                  sagas: details && details.sagas ? details.sagas : (book.sagas || ''),
                  synopsis: details && details.synopsis ? details.synopsis : (book.synopsis || 'No hay sinopsis disponible'),
                  book_pages: details && details.book_pages ? details.book_pages : (book.book_pages || 0),
                  genres: details && details.genres ? details.genres : (book.genres || '')
                };
              });
              
              this.allBooks = enrichedBooks;
              this.filteredBooks = enrichedBooks.filter(book => {
                const titleMatch = book.book_title?.toLowerCase().includes(query) || false;
                const authorMatch = book.authors?.toLowerCase().includes(query) || false;
                const sagaMatch = book.sagas?.toLowerCase().includes(query) || false;
                
                return titleMatch || authorMatch || sagaMatch;
              });
              
              this.totalPages = response.pagination.total_pages;
              this.totalItems = response.pagination.total_items;
              
              this.resetPagination();
            });
        } else {
          this.loading = false;
          this.resetPagination();
        }
      });
  }
  
  /** Realiza una búsqueda local en los libros ya cargados */
  private performLocalSearch(query: string): void {
    this.filteredBooks = this.allBooks.filter(book => {
      const titleMatch = book.book_title?.toLowerCase().includes(query) || false;
      const authorMatch = book.authors?.toLowerCase().includes(query) || false;
      const sagaMatch = book.sagas?.toLowerCase().includes(query) || false;
      
      return titleMatch || authorMatch || sagaMatch;
    });
    
    this.resetPagination();
  }
  
  /** Limpia el término de búsqueda y muestra todos los libros */
  clearSearch(): void {
    this.searchQuery = '';
    this.loadUserBooks(1);
  }

  /** Abre el modal de confirmación para eliminar un libro */
  openDeleteModal(book: UserBook): void {
    this.selectedBookToDelete = book;
    this.isDeleteModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /** Cierra el modal de eliminación */
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.selectedBookToDelete = null;
    document.body.style.overflow = 'auto';
  }

  /** Confirma la eliminación del libro seleccionado */
  confirmDelete(): void {
    if (this.selectedBookToDelete) {
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.closeDeleteModal();
        return;
      }

      this.loading = true;
      
      this.bookService.removeBookFromUser(
        currentUser.nickname, 
        this.selectedBookToDelete.book_id
      )
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al eliminar el libro:', error);
          this.loading = false;
          throw error;
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.allBooks = this.allBooks.filter(
          book => book.book_id !== this.selectedBookToDelete!.book_id
        );
        this.filteredBooks = this.filteredBooks.filter(
          book => book.book_id !== this.selectedBookToDelete!.book_id
        );
        
        this.resetPagination();
        this.closeDeleteModal();
      });
    }
  }

  /** Genera la URL de la imagen del libro según su saga */
  getBookImageUrl(book: UserBook | null): string {
    if (!book) {
      return '/assets/images/book-placeholder.jpg';
    } else {
      const saga = book.sagas;
      
      if (saga) {
        const url = `/libros/${saga}/covers/${book.book_title}.png`;
        return url;
      } else {
        const url = `/libros/covers/${book.book_title}.png`;
        return url;
      }
    }
  }

  /** Obtiene el nombre del autor del libro */
  getAuthorName(book: UserBook | null): string {
    if (!book) {
      return 'Autor desconocido';
    }
    
    return book.authors || 'Autor desconocido';
  }

  /** Retorna la clase CSS para el estilo del estado de lectura */
  getStatusClass(status?: string): string {
    switch(status) {
      case 'en-progreso':
      case 'reading':
        return 'status-reading';
      case 'finalizado':
      case 'completed':
        return 'status-completed';
      case 'abandonado':
      case 'dropped':
        return 'status-abandoned';
      case 'no-iniciado':
      case 'planned':
      default:
        return 'status-not-started';
    }
  }
  
  /** Convierte el código de estado a texto legible */
  getStatusText(status?: string): string {
    switch(status) {
      case 'en-progreso':
      case 'reading':
        return 'Leyendo';
      case 'finalizado':
      case 'completed':
        return 'Completado';
      case 'abandonado':
      case 'dropped':
        return 'Abandonado';
      case 'no-iniciado':
      case 'planned':
      default:
        return 'No iniciado';
    }
  }

}