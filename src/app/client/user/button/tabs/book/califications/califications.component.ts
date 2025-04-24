import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/call-api/book.service';
import { ReadingService } from '../../../../../../core/services/call-api/reading.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { UserBook } from '../../../../../../core/models/call-api/book.model';
import { Review } from '../../../../../../core/models/call-api/reading.model';
import { catchError, finalize, forkJoin, of, Subject, takeUntil } from 'rxjs';

interface SagaInfo {
  name: string;
  author: string;
  books: any[];
  averageRating: number;
}

@Component({
  selector: 'app-califications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.scss'
})
export class CalificationsComponent implements OnInit, OnDestroy {

  librosValorados: any[] = [];
  topLibros: any[] = [];
  sagas: SagaInfo[] = [];
  selectedSaga: SagaInfo | null = null;
  selectedBook: any | null = null;
  isModalOpen: boolean = false;
  isSagaModalOpen: boolean = false;
  loading: boolean = true;
  currentUser: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private bookService: BookService,
    private readingService: ReadingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Obtiene el usuario actual y carga sus libros */
  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      this.loadRatedBooks();
    } else {
      this.loading = false;
    }
  }

  /** Carga los libros valorados del usuario desde la API */
  loadRatedBooks(): void {
    this.loading = true;

    this.readingService.getBookReviews(undefined, this.currentUser, 1, 100)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error al cargar reseñas:', error);
          this.loading = false;
          return of({ data: [], pagination: { page: 1, page_size: 10, total_items: 0, total_pages: 0 } });
        })
      )
      .subscribe(reviews => {
        if (reviews && reviews.data && reviews.data.length > 0) {
          
          const bookIds = reviews.data.map(review => review.book_id);
          
          this.bookService.getBooksWithCache(bookIds)
            .pipe(
              takeUntil(this.destroy$),
              catchError(error => {
                console.error('Error al obtener detalles de libros:', error);
                return of([]);
              }),
              finalize(() => {
                this.loading = false;
              })
            )
            .subscribe(detailedBooks => {
              
              const detailsMap = new Map<number, any>();
              detailedBooks.forEach(book => {
                if (book && book.book_id) {
                  detailsMap.set(book.book_id, book);
                }
              });
              
              const ratedBooks = reviews.data.map(review => {
                const details = detailsMap.get(review.book_id);
                
                return {
                  book_id: review.book_id,
                  book_title: review.book_title,
                  book_pages: details?.book_pages || 0,
                  authors: details?.authors || review.authors || 'Autor desconocido',
                  sagas: details?.sagas || '',
                  genres: details?.genres || '',
                  synopsis: details?.synopsis || '',
                  rating: review.rating,
                  review_text: review.review_text,
                  reading_status: 'completed'
                };
              });
              
              this.librosValorados = ratedBooks.sort((a, b) => {
                const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0);
                const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0);
                return ratingB - ratingA;
              });
              
              this.topLibros = this.librosValorados.slice(0, 3);
              
              this.organizeBySagas(this.librosValorados);
              
            });
        } else {
          this.loading = false;
          this.librosValorados = [];
          this.topLibros = [];
        }
      });
  }
  
  /** Organiza los libros por sagas */
  organizeBySagas(books: any[]): void {
    const sagasMap = new Map<string, any[]>();
    
    books.forEach(book => {
      if (book.sagas) {
        if (!sagasMap.has(book.sagas)) {
          sagasMap.set(book.sagas, []);
        }
        sagasMap.get(book.sagas)?.push(book);
      }
    });
    
    this.sagas = Array.from(sagasMap.entries()).map(([sagaName, sagaBooks]) => {
      const totalRating = sagaBooks.reduce((sum, book) => {
        const rating = typeof book.rating === 'string' ? parseFloat(book.rating) : (book.rating || 0);
        return sum + rating;
      }, 0);
      
      const averageRating = totalRating / sagaBooks.length;
      
      const author = sagaBooks[0]?.authors || 'Autor desconocido';
      
      return {
        name: sagaName,
        author: author,
        books: sagaBooks,
        averageRating: averageRating
      };
    });
    
    this.sagas.sort((a, b) => b.averageRating - a.averageRating);
    
  }

  /** Abre el modal con detalles del libro */
  openBookDetails(book: any): void {
    this.selectedBook = book;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /** Cierra el modal de detalles */
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBook = null;
    document.body.style.overflow = 'auto';
  }
  
  /** Abre el modal con detalles de la saga */
  openSagaDetails(saga: SagaInfo): void {
    this.selectedSaga = saga;
    this.isSagaModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /** Cierra el modal de detalles de saga */
  closeSagaModal(): void {
    this.isSagaModalOpen = false;
    this.selectedSaga = null;
    document.body.style.overflow = 'auto';
  }

  /** Evita que clicks dentro del modal lo cierren */
  preventClose(event: Event): void {
    event.stopPropagation();
  }

  /** Genera la URL de la imagen del libro según su saga */
  getBookImageUrl(book: any | null): string {
    if (!book) {
      return '/assets/images/book-placeholder.jpg';
    } else {
      const saga = book.sagas;
      
      if (saga) {
        return `/libros/${saga}/covers/${book.book_title}.png`;
      } else {
        return `/libros/covers/${book.book_title}.png`;
      }
    }
  }
  
  /** Genera la URL de la imagen representativa de la saga */
  getSagaImageUrl(saga: SagaInfo): string {
    if (saga.books && saga.books.length > 0) {
      return this.getBookImageUrl(saga.books[0]);
    }
    return '/assets/images/book-placeholder.jpg';
  }

  /** Método para generar un array con el número de estrellas para mostrar visualmente */
  getEstrellas(valoracion: number | string | undefined): number[] {
    if (valoracion === undefined || valoracion === null) return [];
    
    let valor: number;
    if (typeof valoracion === 'string') {
      valor = parseFloat(valoracion);
      if (isNaN(valor)) return [];
    } else if (typeof valoracion === 'number') {
      valor = valoracion;
    } else {
      return [];
    }
    
    const estrellasEquivalentes = Math.floor(valor / 2);
    return Array(estrellasEquivalentes).fill(0);
  }

  /** Método para generar un array con las estrellas vacías */
  getEstrellasVacias(valoracion: number | string | undefined): number[] {
    if (valoracion === undefined || valoracion === null) return Array(5).fill(0);
    
    let valor: number;
    if (typeof valoracion === 'string') {
      valor = parseFloat(valoracion);
      if (isNaN(valor)) return Array(5).fill(0);
    } else if (typeof valoracion === 'number') {
      valor = valoracion;
    } else {
      return Array(5).fill(0);
    }
    
    const estrellasLlenas = Math.floor(valor / 2);
    const estrellasVacias = 5 - estrellasLlenas;
    return Array(Math.max(0, estrellasVacias)).fill(0);
  }

  /** Formatea la valoración para mostrarla con un decimal */
  formatRating(rating: any): string {
    if (rating === undefined || rating === null) {
      return 'N/A';
    }
    
    if (typeof rating === 'string') {
      const numericRating = parseFloat(rating);
      if (!isNaN(numericRating)) {
        return numericRating.toFixed(1);
      }
      return rating;
    }
    
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    
    return rating.toString();
  }
}