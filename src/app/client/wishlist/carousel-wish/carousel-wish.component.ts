import { Component, OnInit, OnDestroy, Renderer2, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserBook, Book } from '../../../core/models/call-api/book.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface CarouselBook {
  genres: string[];
  genreColors: string[];
  title: string;
  description: string;
  coverImage: string;
  backgroundImage: string;
}

@Component({
  selector: 'app-carousel-wish',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-wish.component.html',
  styleUrl: './carousel-wish.component.scss',
})
export class CarouselWishComponent implements OnInit, OnDestroy {
  books: CarouselBook[] = [];
  currentIndex = 0;
  private booksSubscription: Subscription | null = null;
  private autoSlideInterval: any;
  private isAnimating = false;
  
  @ViewChildren('carouselItem') carouselItems!: QueryList<ElementRef>;

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private authService: AuthService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser && currentUser.nickname) {
      this.fetchUserBooks(currentUser.nickname);
    }

    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.booksSubscription) {
      this.booksSubscription.unsubscribe();
    }
    this.stopAutoSlide();
  }

  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 10000); // 10 segundos
  }

  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private fetchUserBooks(nickname: string): void {
    this.booksSubscription = forkJoin({
      onHold: this.bookService.getUserBooks(nickname, 'on_hold'),
      planToRead: this.bookService.getUserBooks(nickname, 'plan_to_read')
    }).pipe(
      map(response => {
        return [...response.onHold.data, ...response.planToRead.data];
      })
    ).subscribe({
      next: (books) => {
        const bookDetailsObservables = books.map(book => 
          this.fetchBookDetails(book)
        );

        forkJoin(bookDetailsObservables).subscribe({
          next: (detailedBooks) => {
            this.books = detailedBooks.map(book => 
              this.transformBookToCarouselBook(book)
            );
            this.currentIndex = 0;
          },
          error: (error) => {
            console.error('Error fetching book details:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching user books:', error);
      }
    });
  }

  private fetchBookDetails(book: UserBook) {
    return this.bookService.getBookById(book.book_id).pipe(
      map(bookDetails => {
        return { 
          ...bookDetails, 
          book_title: book.book_title,
          genres: bookDetails.genres ? bookDetails.genres.split(',').map(g => g.trim()) : []
        };
      }),
      catchError(error => {
        console.error(`Error fetching details for book ${book.book_title}:`, error);
        return of({
          book_id: book.book_id,
          book_title: book.book_title,
          book_pages: book.book_pages,
          synopsis: 'No description available',
          genres: [],
          sagas: book.sagas
        });
      })
    );
  }

  private transformBookToCarouselBook(book: {
    book_id: number, 
    book_title: string, 
    synopsis?: string, 
    genres?: string[], 
    sagas?: string
  }): CarouselBook {
    const genres = book.genres || [];
    
    const genreColors = genres.map((_, index) => {
      const colorClasses = [
        'bg-info text-dark', 
        'bg-primary', 
        'bg-danger', 
        'bg-success', 
        'bg-warning'
      ];
      return colorClasses[index % colorClasses.length];
    });
    const sagaName = book.sagas || 'default-saga';
    const coverImage = `/libros/${sagaName}/covers/${book.book_title}.png`;
    const backgroundImage = `/libros/${sagaName}/fondos/fondo1.jpg`;

    return {
      genres,
      genreColors,
      title: book.book_title,
      description: book.synopsis || 'No description available',
      coverImage,
      backgroundImage
    };
  }

  prevSlide(): void {
    if (this.isAnimating || this.books.length <= 1) return;
    this.isAnimating = true;
    this.stopAutoSlide();
    
    const items = this.carouselItems.toArray();
    if (items.length === 0) {
      this.isAnimating = false;
      return;
    }
    
    // Elemento actual
    const currentElement = items[this.currentIndex].nativeElement;
    
    // Calcular el índice anterior
    const prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.books.length - 1;
    const prevElement = items[prevIndex].nativeElement;
    
    // 1. Primero establecer las posiciones iniciales (sin transición)
    this.renderer.removeClass(currentElement, 'sliding');
    this.renderer.removeClass(prevElement, 'sliding');
    
    this.renderer.setStyle(currentElement, 'display', 'block');
    this.renderer.setStyle(currentElement, 'transform', 'translateX(0)');
    
    this.renderer.setStyle(prevElement, 'display', 'block');
    this.renderer.setStyle(prevElement, 'transform', 'translateX(-100%)');
    
    // Forzar un reflow para que los cambios de estilo se apliquen antes de las transiciones
    prevElement.offsetWidth;
    
    // 2. Ahora activar la transición y mover ambos elementos
    setTimeout(() => {
      this.renderer.addClass(currentElement, 'sliding');
      this.renderer.addClass(prevElement, 'sliding');
      
      this.renderer.setStyle(currentElement, 'transform', 'translateX(100%)');
      this.renderer.setStyle(prevElement, 'transform', 'translateX(0)');
      
      // 3. Actualizar el índice actual
      this.currentIndex = prevIndex;
      
      // 4. Limpiar después de que termine la animación
      setTimeout(() => {
        items.forEach(item => {
          const el = item.nativeElement;
          // Quitar todas las clases y estilos de animación
          this.renderer.removeClass(el, 'sliding');
          this.renderer.removeStyle(el, 'transform');
          
          // Ocultar todos excepto el actual
          if (el !== items[this.currentIndex].nativeElement) {
            this.renderer.setStyle(el, 'display', 'none');
            this.renderer.removeClass(el, 'active');
          } else {
            this.renderer.addClass(el, 'active');
            this.renderer.setStyle(el, 'display', 'block');
          }
        });
        
        this.isAnimating = false;
        this.startAutoSlide();
      }, 800); // Duración de la animación
    }, 20);
  }
  

  nextSlide(): void {
    if (this.isAnimating || this.books.length <= 1) return;
    this.isAnimating = true;
    this.stopAutoSlide();
    
    // Obtener los elementos actuales
    const items = this.carouselItems.toArray();
    if (items.length === 0) {
      this.isAnimating = false;
      return;
    }
    
    // Elemento actual 
    const currentElement = items[this.currentIndex].nativeElement;
    
    // Calcular el índice siguiente
    const nextIndex = this.currentIndex < this.books.length - 1 ? this.currentIndex + 1 : 0;
    const nextElement = items[nextIndex].nativeElement;
    
    // 1. Primero establecer las posiciones iniciales (sin transición)
    this.renderer.removeClass(currentElement, 'sliding');
    this.renderer.removeClass(nextElement, 'sliding');
    
    this.renderer.setStyle(currentElement, 'display', 'block');
    this.renderer.setStyle(currentElement, 'transform', 'translateX(0)');
    
    this.renderer.setStyle(nextElement, 'display', 'block');
    this.renderer.setStyle(nextElement, 'transform', 'translateX(100%)');
    
    // Forzar un reflow para que los cambios de estilo se apliquen antes de las transiciones
    nextElement.offsetWidth;
    
    // 2. Ahora activar la transición y mover ambos elementos
    setTimeout(() => {
      this.renderer.addClass(currentElement, 'sliding');
      this.renderer.addClass(nextElement, 'sliding');
      
      this.renderer.setStyle(currentElement, 'transform', 'translateX(-100%)');
      this.renderer.setStyle(nextElement, 'transform', 'translateX(0)');
      
      // 3. Actualizar el índice actual
      this.currentIndex = nextIndex;
      
      // 4. Limpiar después de que termine la animación
      setTimeout(() => {
        items.forEach(item => {
          const el = item.nativeElement;
          // Quitar todas las clases y estilos de animación
          this.renderer.removeClass(el, 'sliding');
          this.renderer.removeStyle(el, 'transform');
          
          // Ocultar todos excepto el actual
          if (el !== items[this.currentIndex].nativeElement) {
            this.renderer.setStyle(el, 'display', 'none');
            this.renderer.removeClass(el, 'active');
          } else {
            this.renderer.addClass(el, 'active');
            this.renderer.setStyle(el, 'display', 'block');
          }
        });
        
        this.isAnimating = false;
        this.startAutoSlide();
      }, 800); // Duración de la animación
    }, 20);
  }
  
  
  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentIndex || index < 0 || index >= this.books.length) return;
    
    // Usamos nextSlide o prevSlide para mantener la animación consistente
    if (index > this.currentIndex) {
      const steps = (index - this.currentIndex) % this.books.length;
      for (let i = 0; i < steps; i++) {
        setTimeout(() => this.nextSlide(), i * 700);
      }
    } else {
      const steps = (this.currentIndex - index) % this.books.length;
      for (let i = 0; i < steps; i++) {
        setTimeout(() => this.prevSlide(), i * 700);
      }
    }
  }
}