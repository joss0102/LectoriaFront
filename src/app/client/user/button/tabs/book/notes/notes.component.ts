import { Component, OnInit } from '@angular/core';
import { ReadingService } from '../../../../../../core/services/call-api/reading.service';
import { BookService } from '../../../../../../core/services/call-api/book.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { Note } from '../../../../../../core/models/call-api/reading.model';
import { Book } from '../../../../../../core/models/call-api/book.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  page = 1;
  pageSize = 100;
  editingNoteId: number | null = null; // Para la edición de nota
  editedNoteText: string = ''; // Texto de la nota cuando estamos en modo edición

  constructor(
    private readingService: ReadingService,
    private bookService: BookService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const nickname = this.authService.currentUserValue?.nickname;
    if (!nickname) return;

    const page = 1;
    const pageSize = 100;

    this.readingService
      .getNotes(undefined, nickname, page, pageSize)
      .subscribe({
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

  // Inicia el modo de edición de la nota
  startEditing(note: Note): void {
    this.editingNoteId = note.id;
    this.editedNoteText = note.text;
  }
  // Cancelar la edición de la nota
  cancelEditing(): void {
    this.editingNoteId = null;
    this.editedNoteText = '';
  }

  // Guardar la nota editada
  saveNote(): void {
    if (this.editingNoteId !== null && this.editedNoteText.trim()) {
      const updatedText = this.editedNoteText.trim();

      this.readingService
        .updateNote(this.editingNoteId, { text: updatedText })
        .subscribe({
          next: () => {
            const noteIndex = this.selectedBook.notas.findIndex(
              (n: Note) => n.id === this.editingNoteId
            );
            if (noteIndex !== -1) {
              this.selectedBook.notas[noteIndex] = {
                ...this.selectedBook.notas[noteIndex],
                text: updatedText,
              };
              this.selectedBook = { ...this.selectedBook }; // Forzar el renderizado
            }
            this.cancelEditing();
          },
          error: (err) => {
            console.error('Error al guardar la nota:', err);
            alert('Hubo un error al guardar la nota.');
          },
        });
    } else {
      alert('No se puede guardar una nota vacía.');
    }
  }

  // Eliminar nota
  deleteNote(noteId: number): void {
    this.readingService.deleteNote(noteId).subscribe({
      next: () => {
        alert('Nota eliminada correctamente');
        // Elimina de la lista del libro actual
        this.selectedBook.notas = this.selectedBook.notas.filter(
          (note: Note) => note.id !== noteId
        );
        this.selectedBook = { ...this.selectedBook }; // Forzar detección de cambios
      },
      error: (err) => {
        console.error('Error al eliminar la nota:', err);
      },
    });
  }
}
