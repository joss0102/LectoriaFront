import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/book/book.service';

import { Book } from '../../../../../../core/models/book-model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {
  // Todos los libros
  allBooks: Book[] = [];
  
  // Libros filtrados que tienen anotaciones
  booksWithNotes: Book[] = [];
  
  // Libro seleccionado para ver detalle completo
  selectedBook: Book | null = null;
  
  // Estado para saber si estamos en vista detalle
  detailView: boolean = false;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.bookService.getAllBooks();
    
    // Filtrar libros que tienen anotaciones
    this.booksWithNotes = this.allBooks.filter(book => 
      !!book.anotaciones && book.anotaciones.length > 0
    );
  }

  // Seleccionar un libro para ver sus anotaciones en detalle
  selectBook(book: Book): void {
    this.selectedBook = book;
    this.detailView = true;
  }

  // Volver a la lista de libros
  backToList(): void {
    this.detailView = false;
    this.selectedBook = null;
  }
  
  // Método para comprobar si un libro tiene anotaciones
  hasNotesAndCover(book: Book): boolean {
    return !!book.anotaciones && book.anotaciones.length > 0 && !!book.imagen;
  }
  
  // Método para acortar una anotación si es muy larga (para vista previa)
  shortenNote(note: string, maxLength: number = 100): string {
    if (note.length <= maxLength) return note;
    return note.substring(0, maxLength - 3) + '...';
  }
}