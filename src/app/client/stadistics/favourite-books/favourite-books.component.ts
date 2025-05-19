import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';

interface FavouriteBook {
  book_id: number;
  book_title: string;
  total_pages: number;
  date_start: string;
  date_ending: string;
  saga?: string;
  author?: string;
  rating?: number;
}

@Component({
  selector: 'app-favourite-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favourite-books.component.html',
  styleUrl: './favourite-books.component.scss',
})
export class FavouriteBooksComponent implements OnInit {
  favBooks: FavouriteBook[] = [];

  constructor(
    private authService: AuthService,
    private bookService: BookService,
    private readingService: ReadingService
  ) {}

  ngOnInit(): void {
    this.loadFavouriteBooks();
  }

  /**
   * Carga los libros favoritos del usuario basado en sus calificaciones
   */
  loadFavouriteBooks(): void {
    const actualUser = this.authService.currentUserValue;
    if (!actualUser?.nickname) return;
    
    this.bookService
      .getUserBooks(actualUser.nickname, 'completed', 1, 100)
      .subscribe({
        next: (userBooks) => {
          const bookIds = userBooks.data.map((ub: any) => ub.book_id);

          this.bookService.getBooksWithCache(bookIds).subscribe({
            next: (bookDetails) => {
              const baseBooks = userBooks.data.map((userBook: any) => {
                const fullBook = bookDetails.find(
                  (b: any) => b.book_id === userBook.book_id
                );
                return {
                  book_id: userBook.book_id,
                  book_title: userBook.book_title,
                  total_pages: userBook.total_pages,
                  date_start: userBook.date_start,
                  date_ending: userBook.date_ending,
                  saga: fullBook?.sagas || 'default',
                  author: fullBook?.authors || 'Desconocido',
                };
              });

              // Obtener reseñas y combinar
              this.readingService
                .getBookReviews(undefined, actualUser.nickname, 1, 100)
                .subscribe({
                  next: (reviewResponse) => {
                    const reviews = reviewResponse.data;
                    this.favBooks = baseBooks
                      .map((book) => {
                        const review = reviews.find(
                          (r) => r.book_id === book.book_id
                        );
                        return {
                          ...book,
                          rating: review?.rating || 0,
                        };
                      })
                      .filter(book => book.rating > 0)
                      .sort((a, b) => (b.rating || 0) - (a.rating || 0))

                      .slice(0, 2);
                  },
                  error: (err) => {
                    console.error('Error al obtener reseñas:', err);
                    this.favBooks = baseBooks.slice(0, 10);
                  },
                });
            },
            error: (err) => {
              console.error('Error al obtener detalles de libros:', err);
            },
          });
        },
        error: (err) => {
          console.error('Error al obtener libros del usuario:', err);
        },
      });
  }

  /**
   * Genera la ruta de la imagen de portada del libro
   */
  getCoverImage(book: FavouriteBook): string {
    const saga = book.saga || 'default';
    const titulo = book.book_title || 'default-title';
    return `/libros/${saga}/covers/${titulo}.png`;
  }
}