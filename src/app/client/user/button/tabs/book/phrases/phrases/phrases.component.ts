import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReadingService } from '../../../../../../../core/services/call-api/reading.service';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';
import { BookService } from '../../../../../../../core/services/call-api/book.service';
import { Phrase } from '../../../../../../../core/models/call-api/reading.model';

interface BookWithPhrases {
  id: number;
  titulo: string;
  autor?: string;
  saga?: string;
  frases: string[];
}

@Component({
  selector: 'app-phrases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phrases.component.html',
  styleUrls: ['./phrases.component.scss'],
})
export class PhrasesComponent implements OnInit {
  booksWithPhrases: BookWithPhrases[] = [];
  selectedBook: BookWithPhrases | null = null;
  detailView: boolean = false;
  loading: boolean = false;

  constructor(
    private readingService: ReadingService,
    private authService: AuthService,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.loading = true;
      this.readingService
        .getPhrases(undefined, user.nickname, 1, 100)
        .subscribe({
          next: (response) => {
            this.processPhrases(response.data);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al obtener frases:', error);
            this.loading = false;
          },
        });
    }
  }

  processPhrases(phrases: Phrase[]): void {
    const grouped: { [title: string]: BookWithPhrases } = {};

    for (const phrase of phrases) {
      const title = phrase.book_title;
      const bookId = phrase.book_id;

      if (!grouped[title]) {
        grouped[title] = {
          id: bookId,
          titulo: title,
          autor: '',
          saga: '',
          frases: [],
        };
      }
      grouped[title].frases.push(phrase.text);
    }

    // Ahora que hemos agrupado las frases, obtenemos los datos de los libros
    this.getBooksData(Object.values(grouped));
  }

  getBooksData(books: BookWithPhrases[]): void {
    // Aquí ahora extraemos los IDs de los libros en lugar de los títulos
    const bookIds = books.map((book) => book.id);

    // Realiza la llamada para obtener los libros con caché usando los IDs
    this.bookService.getBooksWithCache(bookIds).subscribe({
      next: (bookDetails) => {
        // Asociamos los detalles del libro con las frases
        books.forEach((book) => {
          const bookDetail = bookDetails.find(
            (detail) => detail.book_id === book.id
          );
          if (bookDetail) {
            book.saga = bookDetail.sagas || 'default-saga'; // Asigna la saga
            book.autor = bookDetail.authors || '';
          }
        });
        this.booksWithPhrases = books;
      },
      error: (error) => {
        console.error('Error al obtener detalles del libro:', error);
      },
    });
  }

  selectBook(book: BookWithPhrases): void {
    this.selectedBook = book;
    this.detailView = true;
  }

  backToList(): void {
    this.selectedBook = null;
    this.detailView = false;
  }

  shortenPhrase(phrase: string): string {
    return phrase.length > 100 ? phrase.substring(0, 100) + '...' : phrase;
  }

  getCoverImage(book: BookWithPhrases): string {
    const saga = book.saga || 'default-saga';
    const titulo = book.titulo || 'default-title';
    const imageUrl = `/libros/${saga}/covers/${titulo}.png`;
    return imageUrl;
  }
}
