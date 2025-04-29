import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorService } from '../../../core/services/call-api/author.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { AuthService } from '../../../core/services/auth/auth.service';

import { Author } from '../../../core/models/call-api/author.model';
import { UserBook } from '../../../core/models/call-api/book.model';

@Component({
  selector: 'app-data-author',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-author.component.html',
  styleUrl: './data-author.component.scss',
})
export class DataAuthorComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private authorService: AuthorService,
    private bookService: BookService
  ) {}

  currentUser: string = '';
  topAuthors: { author: Author; count: number }[] = [];

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      this.loadUserBooks();
    }
  }

  loadUserBooks(): void {
    this.bookService
      .getUserBooks(this.currentUser, undefined, 1, 1000)
      .subscribe((response) => {
        const userBooks: UserBook[] = response.data || [];
        if (userBooks.length === 0) return;

        this.bookService
          .getBooksWithCache(userBooks.map((book) => book.book_id))
          .subscribe((bookDetails) => {
            const enrichedBooks = userBooks.map((book) => {
              const details = bookDetails.find(
                (d) => d.book_id === book.book_id
              );
              return {
                ...book,
                authors: details?.authors || book.authors || '',
              };
            });

            this.processTopAuthors(enrichedBooks);
          });
      });
  }

  processTopAuthors(books: UserBook[]): void {
    const authorCountMap = new Map<string, { name: string; count: number }>();

    books.forEach((book) => {
      if (!book.authors) return;

      const authorNames = book.authors.split(',').map((name) => name.trim());
      authorNames.forEach((name) => {
        const key = name.toLowerCase();
        if (!authorCountMap.has(key)) {
          authorCountMap.set(key, { name, count: 1 });
        } else {
          authorCountMap.get(key)!.count++;
        }
      });
    });

    this.authorService.getAllAuthors().subscribe((response) => {
      const authors = response.data || [];

      const rankedAuthors = authors
        .map((author) => {
          const fullName = this.getAuthorFullName(author);
          const key = fullName.toLowerCase();
          const count = authorCountMap.get(key)?.count || 0;
          return { author, count };
        })
        .filter((item) => item.count > 0);

      rankedAuthors.sort((a, b) => b.count - a.count);
      this.topAuthors = rankedAuthors.slice(0, 5);
    });
  }

  getAuthorFullName(author: Author): string {
    let fullName = author.name || '';
    if (author.last_name1) {
      fullName += ' ' + author.last_name1;
    }
    if (author.last_name2) {
      fullName += ' ' + author.last_name2;
    }
    return fullName.trim();
  }

  getAuthorImageUrl(author: Author): string {
    if (!author?.name) return '/assets/images/default-author.jpg';

    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }
}
