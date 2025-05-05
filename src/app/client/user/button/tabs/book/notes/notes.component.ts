import { Component, OnInit } from '@angular/core';
import { ReadingService } from '../../../../../../core/services/call-api/reading.service';
import { BookService } from '../../../../../../core/services/call-api/book.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { Note } from '../../../../../../core/models/call-api/reading.model';
import { Book } from '../../../../../../core/models/call-api/book.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  booksWithNotes: {
    book_id: number;
    notas: Note[];
    imagen?: string;
    titulo?: string;
    saga?: string;
    autor?: string;
  }[] = [];

  selectedBook: any = null; // Propiedad para la vista de detalle
  detailView: boolean = false; // Controla la vista de detalles

  constructor(
    private readingService: ReadingService,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const nickname = this.authService.currentUserValue?.nickname;
    if (!nickname) return;

    this.readingService.getNotes(undefined, nickname).subscribe({
      next: (response) => {
        const grouped = this.groupNotesByBook(response.data);
        const bookIds = grouped.map((group) => group.book_id);

        this.bookService.getBooksWithCache(bookIds).subscribe({
          next: (books) => {
            this.booksWithNotes = grouped.map((group) => {
              const book = books.find((b) => b.book_id === group.book_id);
              const imagen = book ? this.getCoverImage(book) : '';
              return {
                ...group,
                titulo: book?.book_title || 'Libro sin título',
                saga: book?.sagas,
                autor: book?.authors || 'Autor desconocido',
                imagen,
              };
            });
          },
          error: (error) => {
            console.error('Error al obtener libros con caché:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error al obtener notas:', error);
      },
    });
  }

  groupNotesByBook(notes: Note[]): { book_id: number; notas: Note[] }[] {
    const grouped: { [key: number]: Note[] } = {};
    notes.forEach((note) => {
      if (!grouped[note.book_id]) {
        grouped[note.book_id] = [];
      }
      grouped[note.book_id].push(note);
    });

    return Object.entries(grouped).map(([book_id, notas]) => ({
      book_id: Number(book_id),
      notas,
    }));
  }

  getCoverImage(book: Book): string {
    const saga = book.sagas || 'default-saga';
    const titulo = book.book_title || 'default-title';
    return `/libros/${saga}/covers/${titulo}.png`;
  }

  selectBook(book: any): void {
    this.selectedBook = book;
    this.detailView = true;
  }

  backToList(): void {
    this.detailView = false;
  }

  copyNote(texto: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      alert('Nota copiada al portapapeles');
    });
  }

  shortenNote(note: string): string {
    return note.length > 100 ? note.slice(0, 100) + '...' : note;
  }
}
