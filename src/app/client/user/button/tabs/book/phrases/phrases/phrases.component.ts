import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadingService } from '../../../../../../../core/services/call-api/reading.service';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';
import { BookService } from '../../../../../../../core/services/call-api/book.service';
import { Phrase } from '../../../../../../../core/models/call-api/reading.model';

interface BookWithPhrases {
  id: number;
  titulo: string;
  autor?: string;
  saga?: string;
  frases: Phrase[];
}

@Component({
  selector: 'app-phrases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phrases.component.html',
  styleUrls: ['./phrases.component.scss'],
})
export class PhrasesComponent implements OnInit {
  booksWithPhrases: BookWithPhrases[] = []; // Lista de libros con frases destacadas
  selectedBook: BookWithPhrases | null = null; // Libro seleccionado para ver sus frases
  detailView: boolean = false; // Controla la vista de detalle del libro
  loading: boolean = false; // Indicador de carga de datos
  // Para la edición de frases
  editingPhraseId: number | null = null;
  editedPhraseText: string = '';

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
        .getPhrases(undefined, user.nickname, 1, 100) // Llama al servicio para obtener frases
        .subscribe({
          next: (response) => {
            this.processPhrases(response.data); // Procesa las frases obtenidas
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
    const grouped: { [title: string]: BookWithPhrases } = {}; // Objeto para agrupar las frases por título de libro

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
      grouped[title].frases.push(phrase); // Agrupa las frases por libro
    }

    // Ahora que hemos agrupado las frases, obtenemos los datos de los libros
    this.getBooksData(Object.values(grouped));
  }

  getBooksData(books: BookWithPhrases[]): void {
    const bookIds = books.map((book) => book.id); // Extrae los IDs de los libros

    this.bookService.getBooksWithCache(bookIds).subscribe({
      next: (bookDetails) => {
        books.forEach((book) => {
          const bookDetail = bookDetails.find(
            (detail) => detail.book_id === book.id
          );
          if (bookDetail) {
            book.saga = bookDetail.sagas || 'default-saga'; // Asigna la saga al libro
            book.autor = bookDetail.authors || ''; // Asigna el autor al libro
          }
        });
        this.booksWithPhrases = books; // Asigna los libros con sus frases
      },
      error: (error) => {
        console.error('Error al obtener detalles del libro:', error);
      },
    });
  }

  selectBook(book: BookWithPhrases): void {
    this.selectedBook = book; // Establece el libro seleccionado
    this.detailView = true; // Cambia la vista a detalle
  }

  backToList(): void {
    this.selectedBook = null; // Restablece el libro seleccionado
    this.detailView = false; // Vuelve a la vista principal
    this.cancelEditing(); // Cancela cualquier edición en curso
  }

  shortenPhrase(phrase: string): string {
    return phrase.length > 100 ? phrase.substring(0, 100) + '...' : phrase; // Acorta la frase si es demasiado larga
  }

  getCoverImage(book: BookWithPhrases): string {
    const saga = book.saga || 'default-saga';
    const titulo = book.titulo || 'default-title';
    const imageUrl = `/libros/${saga}/covers/${titulo}.png`; // Ruta de la imagen de portada
    return imageUrl;
  }

  // Elimina una frase destacada
  deletePhrase(phraseId: number, index: number): void {
    if (phraseId) {
      this.readingService.deletePhrase(phraseId).subscribe({
        next: () => {
          // Eliminar la frase del array de frases en `selectedBook`
          this.selectedBook?.frases.splice(index, 1);
          alert('Frase eliminada con éxito');
        },
        error: (error) => {
          console.error('Error al eliminar la frase:', error);
          alert('Error al eliminar la frase');
        },
      });
    }
  }

  copyToClipboard(phrase: string): void {
    navigator.clipboard.writeText(phrase).then(
      () => {
        alert('Frase copiada al portapapeles');
      },
      (err) => {
        console.error('Error al copiar la frase: ', err);
      }
    );
  }
  startEditing(phrase: Phrase): void {
    this.editingPhraseId = phrase.id;
    this.editedPhraseText = phrase.text;
  }
  cancelEditing(): void {
    this.editingPhraseId = null;
    this.editedPhraseText = '';
  }
  savePhrase(index: number): void {
    if (!this.editingPhraseId || !this.selectedBook) return;
    const phraseData = { text: this.editedPhraseText };
    this.readingService
      .updatePhrase(this.editingPhraseId, phraseData)
      .subscribe({
        next: () => {
          // Actualiza la frase en el array local
          if (this.selectedBook && this.selectedBook.frases[index]) {
            this.selectedBook.frases[index].text = this.editedPhraseText;
          }
          this.cancelEditing();
          alert('Frase actualizada con éxito');
        },
        error: (error) => {
          console.error('Error al actualizar la frase:', error);
          alert('Error al actualizar la frase');
        },
      });
  }
}
