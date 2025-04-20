import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService } from '../../../../../../../core/services/book/books.service';
import { Books } from '../../../../../../../core/models/books-model';

@Component({
  selector: 'app-phrases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phrases.component.html',
  styleUrl: './phrases.component.scss'
})
export class PhrasesComponent implements OnInit {
  // Todos los libros
  allBooks: Books[] = [];
  
  // Libros filtrados que tienen frases
  booksWithPhrases: Books[] = [];
  
  // Libro seleccionado para ver detalle completo
  selectedBook: Books | null = null;
  
  // Estado para saber si estamos en vista detalle
  detailView: boolean = false;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.booksService.getAllBooks();
    
    // Filtrar libros que tienen frases
    this.booksWithPhrases = this.allBooks.filter(book => 
      book.frases && book.frases.length > 0
    );
  }

  // Seleccionar un libro para ver sus frases en detalle
  selectBook(book: Books): void {
    this.selectedBook = book;
    this.detailView = true;
    
    // Nos aseguramos de que el libro seleccionado tenga un array frases, incluso si está vacío
    if (!this.selectedBook.frases) {
      this.selectedBook.frases = [];
    }
  }

  // Volver a la lista de libros
  backToList(): void {
    this.detailView = false;
    this.selectedBook = null;
  }
  
  // Método para comprobar si un libro tiene frases
  hasPhrasesAndCover(book: Books): boolean {
    return !!book.frases && book.frases.length > 0 && !!book.imagen;
  }
  
  // Método para acortar una frase si es muy larga (para vista previa)
  shortenPhrase(phrase: string, maxLength: number = 100): string {
    if (phrase.length <= maxLength) return phrase;
    return phrase.substring(0, maxLength - 3) + '...';
  }
}