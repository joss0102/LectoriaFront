import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../core/services/call-api/book.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { Book } from '../../../core/models/call-api/book.model';

interface CarouselBook {
  book_id: number;
  titulo: string;
  autor: string;
  imagen: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  paginasTotales: number;
  paginasLeidas: number;
  valoracion?: number;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
})
export class CarruselComponent implements OnInit, OnDestroy {
  finishedBooks: CarouselBook[] = [];
  currentIndex = 0;
  itemsToShow = 3;
  isTransitioning = false;
  bookWidth = 400;
  bookGap = 20;
  visibleOffset = 0;
  touchStartX = 0;
  isLoading = true;
  maxVisibleIndicators = 5;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private bookService: BookService,
    private authService: AuthService,
    private readingService: ReadingService
  ) {}

  ngOnInit(): void {
    this.fetchCompletedBooks();
    this.calculateItemsToShow();
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getVisibleIndicators(): number[] {
    if (this.finishedBooks.length <= this.maxVisibleIndicators) {
      return Array.from({ length: this.finishedBooks.length }, (_, i) => i);
    }

    const halfVisible = Math.floor(this.maxVisibleIndicators / 2);
    let start = this.currentIndex - halfVisible;
    let end = this.currentIndex + halfVisible;

    if (start < 0) {
      end += Math.abs(start);
      start = 0;
    }

    if (end >= this.finishedBooks.length) {
      start = Math.max(0, start - (end - this.finishedBooks.length + 1));
      end = this.finishedBooks.length - 1;
    }

    return Array.from(
      { length: Math.min(this.maxVisibleIndicators, end - start + 1) },
      (_, i) => start + i
    );
  }

  fetchCompletedBooks(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser || !currentUser.nickname) {
      console.error('No hay usuario autenticado');
      this.isLoading = false;
      return;
    }

    const sub = this.getAllCompletedBooks(currentUser.nickname).subscribe(allBooks => {
      if (!allBooks || allBooks.length === 0) {
        console.log('No se encontraron libros completados');
        this.isLoading = false;
        return;
      }
      
      const bookIds = allBooks.map(book => book.book_id);
      
      const requests = {
        bookDetails: this.bookService.getBooksWithCache(bookIds).pipe(
          catchError(error => {
            console.error('Error al obtener detalles de libros:', error);
            return of([]);
          })
        ),
        
        reviews: this.readingService.getBookReviews(undefined, currentUser.nickname).pipe(
          map(response => response.data || []),
          catchError(error => {
            console.error('Error al obtener reseñas:', error);
            return of([]);
          })
        )
      };
      
      forkJoin(requests).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe(results => {
        const { bookDetails, reviews } = results;
        
        const detailsMap = new Map(
          bookDetails.map((book: Book) => [book.book_id, book])
        );
        
        const reviewsMap = new Map(
          reviews.map(review => [review.book_id, review])
        );
        
        this.finishedBooks = allBooks.map(userBook => {
          const bookDetail = detailsMap.get(userBook.book_id);
          const review = reviewsMap.get(userBook.book_id);
          
          const sagaName = bookDetail?.sagas || userBook.sagas || 'default-saga';
          const dateStart = userBook.date_start ? new Date(userBook.date_start) : null;
          const dateEnd = userBook.date_ending ? new Date(userBook.date_ending) : null;
          const pages = bookDetail?.book_pages || userBook.book_pages || 0;
          const pagesRead = userBook.pages_read || pages;
          
          return {
            book_id: userBook.book_id,
            titulo: userBook.book_title,
            autor: bookDetail?.authors || userBook.authors || 'Autor desconocido',
            imagen: `/libros/${sagaName}/covers/${userBook.book_title}.png`,
            fechaInicio: dateStart,
            fechaFin: dateEnd,
            paginasTotales: pages,
            paginasLeidas: pagesRead,
            valoracion: review?.rating
          };
        });
        
        if (this.finishedBooks.length > 0) {
          this.updateSelectedBook();
        }
      });
    });
    
    this.subscriptions.push(sub);
  }

  getAllCompletedBooks(nickname: string) {
    const pageSize = 50;
    
    return this.bookService.getUserBooks(nickname, 'completed', 1, pageSize).pipe(
      map(response => {
        const allBooks = [...response.data];
        const totalPages = response.pagination.total_pages;
        
        if (totalPages <= 1) {
          return allBooks;
        }
        
        const remainingRequests = [];
        for (let page = 2; page <= totalPages; page++) {
          remainingRequests.push(
            this.bookService.getUserBooks(nickname, 'completed', page, pageSize)
          );
        }
        
        if (remainingRequests.length > 0) {
          forkJoin(remainingRequests).subscribe(responses => {
            responses.forEach(pageResponse => {
              allBooks.push(...pageResponse.data);
            });
          });
        }
        
        return allBooks;
      }),
      catchError(error => {
        console.error('Error al obtener libros:', error);
        return of([]);
      })
    );
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateItemsToShow();
    
    if (this.currentIndex >= this.finishedBooks.length) {
      this.currentIndex = this.finishedBooks.length - 1;
    }
  }

  calculateItemsToShow() {
    const width = window.innerWidth;
    if (width < 600) {
      this.itemsToShow = 1;
      this.bookWidth = width * 0.8;
    } else if (width < 1000) {
      this.itemsToShow = 2;
      this.bookWidth = width * 0.4;
    } else {
      this.itemsToShow = 3;
      this.bookWidth = 350;
    }
    
    this.bookGap = Math.max(20, width * 0.02);
    
    setTimeout(() => {}, 0);
  }

  getBookTransform(index: number): string {
    let relativeIndex = index - this.currentIndex;
    
    if (relativeIndex < -Math.floor(this.itemsToShow/2)) {
      relativeIndex += this.finishedBooks.length;
    } else if (relativeIndex > this.finishedBooks.length - Math.ceil(this.itemsToShow/2)) {
      relativeIndex -= this.finishedBooks.length;
    }
    
    let position = relativeIndex * (this.bookWidth + this.bookGap);
    
    const carouselContent = document.querySelector('.carrusel-content');
    const carouselCenter = carouselContent?.clientWidth ?? window.innerWidth;
    
    if (this.itemsToShow === 1) {
      position += (carouselCenter / 2) - (this.bookWidth / 2);
    } 
    else if (this.itemsToShow === 2) {
      if (relativeIndex === 0) {
        position += (carouselCenter / 2) - (this.bookWidth / 2) - (this.bookGap / 2);
      } else if (relativeIndex === 1) {
        position += (carouselCenter / 2) - (this.bookWidth / 2) - (this.bookGap / 2);
      } else {
        position += (carouselCenter / 2) - (this.bookWidth / 2);
      }
    } 
    else {
      position += (carouselCenter / 2) - (this.bookWidth / 2);
    }
    
    let scale = 1;
    if (relativeIndex !== 0) {
      scale = 0.92;
      
      if (Math.abs(relativeIndex) > 1) {
        scale = 0.85;
      }
    }
    
    return `translateX(${position}px) scale(${scale})`;
  }

  nextBook() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.finishedBooks.length;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  prevBook() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex - 1 + this.finishedBooks.length) % this.finishedBooks.length;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  goToBook(index: number) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500);
  }

  updateSelectedBook() {
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    if (this.isTransitioning) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        this.nextBook();
      } else {
        this.prevBook();
      }
    }
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  getBookOpacity(index: number): number {
    let relativeIndex = this.getRelativeIndex(index);
    
    if (this.itemsToShow === 1) {
      if (relativeIndex === 0) {
        return 1;
      } 
      else if (Math.abs(relativeIndex) === 1) {
        return 0.3;
      }
      else {
        return 0;
      }
    }
    
    else if (this.itemsToShow === 2) {
      if (relativeIndex === 0) {
        return 1;
      }
      else if (relativeIndex === 1) {
        return 0.9;
      }
      else if (relativeIndex === -1) {
        return 0.7;
      }
      else if (relativeIndex === 2) {
        return 0.3;
      }
      else {
        return 0;
      }
    }
    
    else {
      if (relativeIndex === 0) {
        return 1;
      }
      else if (Math.abs(relativeIndex) === 1) {
        return 0.8;
      }
      else if (relativeIndex === 2) {
        return 0.4;
      }
      else if (relativeIndex === -2) {
        return 0.4;
      }
      else {
        return 0;
      }
    }
  }
  
  getRelativeIndex(index: number): number {
    let relativeIndex = index - this.currentIndex;
    
    if (relativeIndex < -Math.floor(this.finishedBooks.length / 2)) {
      relativeIndex += this.finishedBooks.length;
    } else if (relativeIndex > Math.floor(this.finishedBooks.length / 2)) {
      relativeIndex -= this.finishedBooks.length;
    }
    
    return relativeIndex;
  }
}