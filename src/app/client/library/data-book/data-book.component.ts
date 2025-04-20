import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../core/services/call-api/book.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserBook, UserBookResponse, Book } from '../../../core/models/call-api/book.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


interface BookWithAuthor extends UserBook {
  authorName?: string;
  authorId?: number;
  sagaName?: string;
}

@Component({
  selector: 'app-data-book',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-book.component.html',
  styleUrl: './data-book.component.scss'
})
export class DataBookComponent implements OnInit {
  recentBooks: BookWithAuthor[] = [];
  loading = true;
  error = false;
  noRecentBooks = false;
  
  constructor(
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRecentBooks();
  }

  loadRecentBooks(): void {
    const currentUser = this.authService.currentUserValue;
    
    if (!currentUser) {
      this.error = true;
      this.loading = false;
      return;
    }
    console.log('Usuario actual:', currentUser);
    
    this.bookService.getUserBooks(currentUser.nickname, undefined, 1, 200)
      .pipe(
        tap((response: UserBookResponse) => {
          response.data.forEach((book: UserBook) => {
          });
        }),
        map((response: UserBookResponse) => {
          const sortedBooks = [...response.data].sort((a: UserBook, b: UserBook) => {
            return b.book_id - a.book_id;
          });
          
          sortedBooks.slice(0, 10).forEach((book: UserBook, index: number) => {
          });
          
          return sortedBooks.slice(0, 5);
        }),
        switchMap((books: UserBook[]) => {
          if (books.length === 0) {
            this.noRecentBooks = true;
            return of([]);
          }
          
          const booksDetailsRequests = books.map((book: UserBook) => {
            
            return this.bookService.getBookById(book.book_id).pipe(
              tap((bookDetails: Book) => {
              }),
              map((bookDetails: Book) => {
                return {
                  ...book,
                  authors: bookDetails.authors || 'Autor desconocido',
                  sagas: bookDetails.sagas || 'default-saga'
                } as BookWithAuthor;
              }),
              catchError(error => {
                return of({
                  ...book,
                  authors: 'Autor desconocido',
                  sagas: 'default-saga'
                } as BookWithAuthor);
              })
            );
          });
          
          return forkJoin(booksDetailsRequests);
        }),
        switchMap((booksWithDetails: BookWithAuthor[]) => {
          const booksWithAuthorRequests = booksWithDetails.map(book => {
            
            if (!book.authors || book.authors === 'Autor desconocido') {
              return of(book);
            }
            
            const firstAuthor = book.authors.split(',')[0].trim();
            
            return of({
              ...book,
              authorName: firstAuthor
            });
          });
          
          return forkJoin(booksWithAuthorRequests);
        })
      )
      .subscribe({
        next: (booksWithAuthors: BookWithAuthor[]) => {
          this.recentBooks = booksWithAuthors;
          this.loading = false;
          
          this.recentBooks.forEach((book: BookWithAuthor) => {
          });
        },
        error: (err: any) => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  getCoverImage(book: BookWithAuthor): string {
    const imageUrl = `/libros/${book.sagas}/covers/${book.book_title}.png`;
    return imageUrl;
  }
}
