import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService } from '../../../../../../core/services/book/books.service';

import { Books } from '../../../../../../core/models/books-model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss'
})
export class NotesComponent implements OnInit {
  // Todos los libros
  allBooks: Books[] = [];
  
  // Libros filtrados que tienen anotaciones
  booksWithNotes: Books[] = [];
  
  // Libro seleccionado para ver detalle completo
  selectedBook: Books | null = null;
  
  // Estado para saber si estamos en vista detalle
  detailView: boolean = false;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.booksService.getAllBooks();
    
    // Filtrar libros que tienen anotaciones
    this.booksWithNotes = this.allBooks.filter(book => 
      !!book.anotaciones && book.anotaciones.length > 0
    );
  }

  // Seleccionar un libro para ver sus anotaciones en detalle
  selectBook(book: Books): void {
    this.selectedBook = book;
    this.detailView = true;
  }

  // Volver a la lista de libros
  backToList(): void {
    this.detailView = false;
    this.selectedBook = null;
  }
  
  // Método para comprobar si un libro tiene anotaciones
  hasNotesAndCover(book: Books): boolean {
    return !!book.anotaciones && book.anotaciones.length > 0 && !!book.imagen;
  }
  
  // Método para acortar una anotación si es muy larga (para vista previa)
  shortenNote(note: string, maxLength: number = 100): string {
    if (note.length <= maxLength) return note;
    return note.substring(0, maxLength - 3) + '...';
  }
}