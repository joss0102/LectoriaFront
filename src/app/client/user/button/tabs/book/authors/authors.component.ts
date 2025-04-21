import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

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
export class AuthorsComponent implements OnInit {
  allAuthors: AuthorWithBooks[] = [];
  filteredAuthors: AuthorWithBooks[] = [];
  selectedAuthor: AuthorWithBooks | null = null;
  
  isModalOpen: boolean = false;
  searchQuery: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  
  currentUserNickname: string = '';

  userBooks: UserBook[] = [];

  constructor(
    private authorService: AuthorService,
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.currentUserNickname = currentUser.nickname;
      this.loadAuthorsAndUserBooks();
    } else {
      this.errorMessage = 'Usuario no autenticado';
      this.isLoading = false;
    }
  }
  
  // Cargar autores y libros del usuario
  loadAuthorsAndUserBooks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Cargando datos del usuario:', this.currentUserNickname);

    this.bookService.getUserBooks(this.currentUserNickname, undefined, 1, 100).pipe(
      catchError(error => {
        console.error('Error al obtener libros del usuario:', error);
        return of({ data: [] });
      }),
      switchMap(userBooksResponse => {
        this.userBooks = userBooksResponse.data || [];
        console.log('Libros del usuario cargados:', this.userBooks.length);
        
        if (this.userBooks.length === 0) {
          return of({ data: [] });
        }
        return this.authorService.getAllAuthors().pipe(
          catchError(error => {
            console.error('Error al obtener autores:', error);
            return of({ data: [] });
          })
        );
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(authorsResponse => {
      const authors = authorsResponse.data || [];
      console.log('Autores cargados:', authors.length);
      
      if (authors.length === 0) {
        this.errorMessage = 'No se pudieron cargar los autores';
        return;
      }
      
      this.processAuthors(authors);
    });
  }
  
  // Procesar los autores y obtener sus libros
  private processAuthors(authors: Author[]): void {
    const authorsWithBooks: AuthorWithBooks[] = [];
    let processedCount = 0;
    
    authors.forEach(author => {
      this.authorService.getAuthorBooks(author.id).pipe(
        catchError(error => {
          console.error(`Error al obtener libros del autor ${author.name}:`, error);
          return of({ data: [] });
        })
      ).subscribe(authorBooksResponse => {
        processedCount++;
        const authorBooks = authorBooksResponse.data || [];
        console.log(`Autor ${author.name}: ${authorBooks.length} libros encontrados`);
        
        const userAuthorBooks = this.filterUserBooks(authorBooks);
        
        if (userAuthorBooks.length > 0) {
          const authorWithBooks: AuthorWithBooks = {
            ...author,
            books: userAuthorBooks,
            bookReviews: {}
          };
          
          authorsWithBooks.push(authorWithBooks);
          console.log(`Autor añadido: ${author.name} con ${userAuthorBooks.length} libros del usuario`);
        }
        
        if (processedCount === authors.length) {
          this.updateAuthorsList(authorsWithBooks);
        }
      });
    });
  }
  
  private filterUserBooks(authorBooks: AuthorBook[]): UserBook[] {
    const userAuthorBooks: UserBook[] = [];
    
    authorBooks.forEach(authorBook => {
      const matchingUserBooks = this.userBooks.filter(userBook => 
        userBook.book_id === authorBook.id || 
        userBook.book_title.toLowerCase() === authorBook.title.toLowerCase()
      );
      
      userAuthorBooks.push(...matchingUserBooks);
    });
    
    return userAuthorBooks;
  }
  
  // Actualizar la lista de autores
  private updateAuthorsList(authorsWithBooks: AuthorWithBooks[]): void {
    if (authorsWithBooks.length === 0) {
      this.errorMessage = 'No se encontraron autores para tus libros';
      return;
    }
    authorsWithBooks.sort((a, b) => this.getAuthorFullName(a).localeCompare(this.getAuthorFullName(b)));
    
    this.allAuthors = authorsWithBooks;
    this.filteredAuthors = [...this.allAuthors];
    
    console.log('Total de autores procesados:', this.allAuthors.length);
    
    this.loadReviewsForTopAuthors();
  }
  
  // Cargar reseñas para los autores principales
  private loadReviewsForTopAuthors(): void {
    if (this.allAuthors.length === 0) return;
    
    const topAuthors = [...this.allAuthors]
      .sort((a, b) => b.books.length - a.books.length)
      .slice(0, 5);
    
    topAuthors.forEach(author => this.loadReviewsForAuthor(author));
  }
  
  // Cargar reseñas para un autor específico
  private loadReviewsForAuthor(author: AuthorWithBooks): void {
    if (!author.books || author.books.length === 0) return;
    
    if (!author.bookReviews) {
      author.bookReviews = {};
    }
    const booksToLoad = author.books.slice(0, 5);
    
    booksToLoad.forEach(book => {
      if (author.bookReviews![book.book_id]) return;
      
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
    
    this.loadReviewsForAuthor(author);
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
      case 'reading':
        return 'status-reading';
      case 'completed':
        return 'status-completed';
      case 'dropped':
        return 'status-abandoned';
      case 'on_hold':
        return 'status-not-started';
      case 'planned':
      default:
        return 'status-not-started';
    }
  }
  
  // Método para obtener el texto del estado
  getStatusText(status?: string): string {
    switch(status) {
      case 'reading':
        return 'Leyendo';
      case 'completed':
        return 'Completado';
      case 'dropped':
        return 'Abandonado';
      case 'on_hold':
        return 'En pausa';
      case 'planned':
      default:
        return 'No iniciado';
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
    if (!author || !author.books || !author.books.length) {
      return 0;
    }
    
    return author.books.reduce((total, book) => {
      const pages = book.book_pages ? parseInt(String(book.book_pages), 10) : 0;
      return isNaN(pages) ? total : total + pages;
    }, 0);
  }
  
  // Obtener páginas leídas de todos los libros de un autor
  getReadPages(author: AuthorWithBooks): number {
    if (!author || !author.books || !author.books.length) {
      return 0;
    }
    
    return author.books.reduce((total, book) => {
      const pagesRead = book.pages_read ? parseInt(String(book.pages_read), 10) : 0;
      return isNaN(pagesRead) ? total : total + pagesRead;
    }, 0);
  }
  
  // Obtener valoración media de los libros de un autor
  getAverageRating(author: AuthorWithBooks): string {
    if (!author || !author.books || !author.books.length) {
      return 'N/A';
    }
    
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
    
    if (ratingCount === 0) {
      return 'N/A';
    }
    return (totalRating / ratingCount).toFixed(1);
  }
  
  // Obtener la URL de la imagen del autor
  getAuthorImageUrl(author: Author | AuthorWithBooks): string {
    if (!author || !author.name) {
      return '/assets/images/default-author.jpg';
    }
    const fullName = this.getAuthorFullName(author);
    
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }
  
  // Obtener la URL de la imagen de portada del libro
  getBookCoverUrl(book: UserBook | null): string {
    if (!book || !book.book_title) {
      return '/assets/images/default-book.jpg';
    }
    
    if (book.sagas) {
      return `/libros/${book.sagas}/covers/${book.book_title}.png`;
    } else {
      return `/libros/covers/${book.book_title}.png`;
    }
  }
  
  // Obtener la URL del banner del autor
  getAuthorBannerUrl(author: Author | AuthorWithBooks): string {
    if (!author) {
      return '/assets/images/default-banner.jpg';
    }
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