import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../../core/services/book/book.service';
import { Book } from '../../../../../../../core/models/book-model';


@Component({
  selector: 'app-phrases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phrases.component.html',
  styleUrl: './phrases.component.scss'
})
export class PhrasesComponent implements OnInit {
  // Todos los libros
  allBooks: Book[] = [];
  
  // Libros filtrados que tienen frases
  booksWithPhrases: Book[] = [];
  
  // Libro seleccionado para ver detalle completo
  selectedBook: Book | null = null;
  
  // Estado para saber si estamos en vista detalle
  detailView: boolean = false;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.bookService.getAllBooks();
    
    // Filtrar libros que tienen frases
    this.booksWithPhrases = this.allBooks.filter(book => 
      book.frases && book.frases.length > 0
    );
  }

  // Seleccionar un libro para ver sus frases en detalle
  selectBook(book: Book): void {
    this.selectedBook = book;
    this.detailView = true;
  }

  // Volver a la lista de libros
  backToList(): void {
    this.detailView = false;
    this.selectedBook = null;
  }
  
  // Método para comprobar si un libro tiene frases
  hasPhrasesAndCover(book: Book): boolean {
    return !!book.frases && book.frases.length > 0 && !!book.imagen;
  }
  
  // Método para acortar una frase si es muy larga (para vista previa)
  shortenPhrase(phrase: string, maxLength: number = 100): string {
    if (phrase.length <= maxLength) return phrase;
    return phrase.substring(0, maxLength - 3) + '...';
  }
}