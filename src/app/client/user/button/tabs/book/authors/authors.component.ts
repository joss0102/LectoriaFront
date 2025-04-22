import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

import { AuthorService } from '../../../../../../core/services/call-api/author.service';
import { BookService } from '../../../../../../core/services/call-api/book.service';
import { ReadingService } from '../../../../../../core/services/call-api/reading.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';

import { Author, AuthorBook } from '../../../../../../core/models/call-api/author.model';
import { UserBook } from '../../../../../../core/models/call-api/book.model';
import { Review } from '../../../../../../core/models/call-api/reading.model';

interface AuthorWithBooks extends Author {
  books: UserBook[];
  bookReviews?: { [bookId: number]: Review[] };
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})
export class AuthorsComponent implements OnInit, OnDestroy {
  allAuthors: AuthorWithBooks[] = [];
  filteredAuthors: AuthorWithBooks[] = [];
  selectedAuthor: AuthorWithBooks | null = null;
  
  isModalOpen: boolean = false;
  searchQuery: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  currentUserNickname: string = '';
  private destroy$ = new Subject<void>();
  
  constructor(
    private authorService: AuthorService,
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.allAuthors = [];
    
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUserNickname = currentUser.nickname;
      this.loadUserBooksAndAuthors();
    } else {
      this.errorMessage = 'Usuario no autenticado';
      this.isLoading = false;
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Cargar libros y autores de forma simplificada
  loadUserBooksAndAuthors(): void {
    this.isLoading = true;
    
    // 1. Cargar todos los libros del usuario
    this.bookService.getUserBooks(this.currentUserNickname, undefined, 1, 1000)
      .pipe(
        catchError(error => {
          console.error('Error al cargar libros:', error);
          return of({ data: [] });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(response => {
        const userBooks = response.data || [];
        
        if (userBooks.length === 0) {
          this.errorMessage = 'No se encontraron libros en tu biblioteca';
          this.isLoading = false;
          return;
        }
        
        // 2. Obtener detalles completos de los libros
        const bookDetailsRequests = userBooks.map(book => 
          this.bookService.getBookById(book.book_id).pipe(
            catchError(() => of(null))
          )
        );
        
        forkJoin(bookDetailsRequests)
          .pipe(takeUntil(this.destroy$))
          .subscribe(detailsResults => {
            // Combinar detalles con libros originales
            const enrichedBooks = userBooks.map((book, i) => {
              const details = detailsResults[i];
              if (details) {
                return {
                  ...book,
                  sagas: details.sagas || book.sagas || '',
                  authors: details.authors || book.authors || ''
                };
              }
              return book;
            });
            
            // 3. Cargar autores
            this.authorService.getAllAuthors()
              .pipe(
                catchError(() => of({ data: [] })),
                takeUntil(this.destroy$),
                finalize(() => this.isLoading = false)
              )
              .subscribe(authorsResponse => {
                const authors = authorsResponse.data || [];
                
                if (authors.length === 0) {
                  this.errorMessage = 'No se pudieron cargar los autores';
                  return;
                }
                
                this.processAuthorsWithBooks(authors, enrichedBooks);
              });
          });
      });
  }
  
  // Relacionar autores con libros
  private processAuthorsWithBooks(authors: Author[], books: UserBook[]): void {
    // Agrupar libros por autor
    const booksByAuthor = new Map<string, UserBook[]>();
    
    books.forEach(book => {
      if (!book.authors) return;
      
      // Separar en caso de múltiples autores
      const authorNames = book.authors.split(',').map(name => name.trim().toLowerCase());
      
      authorNames.forEach(name => {
        if (!booksByAuthor.has(name)) {
          booksByAuthor.set(name, []);
        }
        booksByAuthor.get(name)?.push(book);
      });
    });
    
    // Crear lista de autores con sus libros
    const authorsWithBooks: AuthorWithBooks[] = [];
    
    authors.forEach(author => {
      const fullName = this.getAuthorFullName(author).toLowerCase();
      const authorBooks = booksByAuthor.get(fullName) || [];
      
      if (authorBooks.length > 0) {
        authorsWithBooks.push({
          ...author,
          books: authorBooks,
          bookReviews: {}
        });
      }
    });
    
    if (authorsWithBooks.length === 0) {
      this.errorMessage = 'No se encontraron autores para tus libros';
      return;
    }
    
    // Ordenar y guardar
    authorsWithBooks.sort((a, b) => 
      this.getAuthorFullName(a).localeCompare(this.getAuthorFullName(b))
    );
    
    this.allAuthors = authorsWithBooks;
    this.filteredAuthors = [...this.allAuthors];
    
    // Cargar reseñas para los principales autores
    this.loadTopAuthorsReviews();
  }
  
  // Cargar reseñas solo para autores principales
  private loadTopAuthorsReviews(): void {
    if (this.allAuthors.length === 0) return;
    
    // Solo los 5 autores con más libros
    const topAuthors = [...this.allAuthors]
      .sort((a, b) => b.books.length - a.books.length)
      .slice(0, 5);
      
    topAuthors.forEach(author => this.loadAuthorReviews(author));
  }
  
  // Cargar reseñas para un autor específico
  private loadAuthorReviews(author: AuthorWithBooks): void {
    if (!author.books || author.books.length === 0) return;
    
    author.bookReviews = author.bookReviews || {};
    
    // Solo primeros 3 libros
    const topBooks = author.books.slice(0, 3);
    
    topBooks.forEach(book => {
      this.readingService.getBookReviews(book.book_title, this.currentUserNickname)
        .pipe(catchError(() => of({ data: [] })))
        .subscribe(response => {
          if (response && response.data && response.data.length > 0) {
            author.bookReviews![book.book_id] = response.data;
          }
        });
    });
  }

  // Mostrar modal con detalles del autor
  openAuthorDetails(author: AuthorWithBooks): void {
    this.selectedAuthor = author;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Cargar reseñas si no están cargadas
    this.loadAuthorReviews(author);
  }

  // Cerrar modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAuthor = null;
    document.body.style.overflow = '';
  }
  
  // Prevenir que los clics dentro del modal cierren el modal
  preventClose(event: Event): void {
    event.stopPropagation();
  }
  
  // Método para buscar autores
  searchAuthors(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredAuthors = [...this.allAuthors];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAuthors = this.allAuthors.filter(author => {
      const fullName = this.getAuthorFullName(author).toLowerCase();
      return fullName.includes(query);
    });
  }
  
  // Limpiar la búsqueda
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredAuthors = [...this.allAuthors];
  }
  
  // Obtener el nombre completo del autor
  getAuthorFullName(author: Author | AuthorWithBooks): string {
    let fullName = author.name || '';
    if (author.last_name1) {
      fullName += ' ' + author.last_name1;
    }
    if (author.last_name2) {
      fullName += ' ' + author.last_name2;
    }
    return fullName.trim();
  }
  
  // Método para obtener la clase CSS según el estado del libro
  getStatusClass(status?: string): string {
    switch(status) {
      case 'reading': return 'status-reading';
      case 'completed': return 'status-completed';
      case 'dropped': return 'status-abandoned';
      case 'on_hold': return 'status-not-started';
      default: return 'status-not-started';
    }
  }
  
  // Método para obtener el texto del estado
  getStatusText(status?: string): string {
    switch(status) {
      case 'reading': return 'Leyendo';
      case 'completed': return 'Completado';
      case 'dropped': return 'Abandonado';
      case 'on_hold': return 'En pausa';
      default: return 'No iniciado';
    }
  }
  
  // Obtener libros finalizados de un autor
  getFinishedBooks(author: AuthorWithBooks): UserBook[] {
    return author.books.filter(book => book.reading_status === 'completed');
  }
  
  // Verificar si hay libros leídos o en progreso
  hasReadBooks(author: AuthorWithBooks): boolean {
    return author.books.some(book => 
      book.reading_status === 'completed' || book.reading_status === 'reading'
    );
  }
  
  // Obtener páginas totales de todos los libros de un autor
  getTotalPages(author: AuthorWithBooks): number {
    if (!author?.books?.length) return 0;
    
    return author.books.reduce((total, book) => {
      const pages = book.book_pages ? parseInt(String(book.book_pages), 10) : 0;
      return isNaN(pages) ? total : total + pages;
    }, 0);
  }
  
  // Obtener páginas leídas de todos los libros de un autor
  getReadPages(author: AuthorWithBooks): number {
    if (!author?.books?.length) return 0;
    
    return author.books.reduce((total, book) => {
      const pagesRead = book.pages_read ? parseInt(String(book.pages_read), 10) : 0;
      return isNaN(pagesRead) ? total : total + pagesRead;
    }, 0);
  }
  
  // Obtener valoración media de los libros de un autor
  getAverageRating(author: AuthorWithBooks): string {
    if (!author?.books?.length) return 'N/A';
    
    let totalRating = 0;
    let ratingCount = 0;
    
    if (author.bookReviews) {
      Object.values(author.bookReviews).forEach(reviews => {
        reviews.forEach(review => {
          if (review.rating !== undefined && !isNaN(review.rating)) {
            totalRating += review.rating;
            ratingCount++;
          }
        });
      });
    }
    
    return ratingCount === 0 ? 'N/A' : (totalRating / ratingCount).toFixed(1);
  }
  
  // Obtener la URL de la imagen del autor
  getAuthorImageUrl(author: Author | AuthorWithBooks): string {
    if (!author?.name) return '/assets/images/default-author.jpg';
    
    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }
  
  // Obtener la URL de la imagen de portada del libro
  getBookCoverUrl(book: UserBook | null): string {
    if (!book?.book_title) return '/assets/images/default-book.jpg';
    
    // Verificar si el libro tiene saga
    if (book.sagas && book.sagas.trim() !== '') {
      return `/libros/${book.sagas}/covers/${book.book_title}.png`;
    }
    
    return `/libros/covers/${book.book_title}.png`;
  }
  
  // Obtener la URL del banner del autor
  getAuthorBannerUrl(author: Author | AuthorWithBooks): string {
    if (!author) return '/assets/images/default-banner.jpg';
    
    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/banner/fondo1.jpg`;
  }
  
  // Manejar error al cargar imagen
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    
    if (imgElement.classList.contains('author-img')) {
      imgElement.src = '/assets/images/default-author.jpg';
    } else if (imgElement.classList.contains('book-img')) {
      imgElement.src = '/assets/images/default-book.jpg';
    } else if (imgElement.classList.contains('banner-img')) {
      imgElement.src = '/assets/images/default-banner.jpg';
    }
  }
}