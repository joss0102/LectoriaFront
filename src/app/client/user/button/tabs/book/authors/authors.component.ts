import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../../../../../core/services/book/book.service';
import { Book } from '../../../../../../core/models/book-model';

// Interfaz para representar un autor con sus libros
interface Author {
  name: string;
  books: Book[];
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.scss'
})
export class AuthorsComponent implements OnInit {
  // Todos los libros
  allBooks: Book[] = [];
  
  // Todos los autores extraídos de los libros
  allAuthors: Author[] = [];
  
  // Autores filtrados para mostrar (según búsqueda)
  filteredAuthors: Author[] = [];
  
  // Autor seleccionado para ver en el modal
  selectedAuthor: Author | null = null;
  
  // Estado del modal
  isModalOpen: boolean = false;
  
  // Búsqueda
  searchQuery: string = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.allBooks = this.bookService.getAllBooks();
    
    // Extraer autores únicos y agrupar sus libros
    this.extractAuthors();
    
    // Inicializar autores filtrados
    this.filteredAuthors = [...this.allAuthors];
  }
  
  // Método para extraer autores únicos de los libros
  private extractAuthors(): void {
    // Crear un mapa para agrupar los libros por autor
    const authorsMap = new Map<string, Book[]>();
    
    // Agrupar los libros por autor
    this.allBooks.forEach(book => {
      if (!authorsMap.has(book.autor)) {
        authorsMap.set(book.autor, []);
      }
      authorsMap.get(book.autor)?.push(book);
    });
    
    // Convertir el mapa a un array de objetos Author
    this.allAuthors = Array.from(authorsMap).map(([name, books]) => ({
      name,
      books
    }));
    
    // Ordenar autores alfabéticamente
    this.allAuthors.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Mostrar modal con detalles del autor
  openAuthorDetails(author: Author): void {
    this.selectedAuthor = author;
    this.isModalOpen = true;
    // Evitar scroll en el cuerpo cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  // Cerrar modal
  closeModal(): void {
    this.isModalOpen = false;
    this.selectedAuthor = null;
    // Restaurar scroll en el cuerpo
    document.body.style.overflow = 'auto';
  }
  
  // Prevenir que los clics dentro del modal cierren el modal
  preventClose(event: Event): void {
    event.stopPropagation();
  }
  
  // Método para buscar autores
  searchAuthors(): void {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.filteredAuthors = [...this.allAuthors];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAuthors = this.allAuthors.filter(author => 
      author.name.toLowerCase().includes(query)
    );
  }
  
  // Limpiar la búsqueda
  clearSearch(): void {
    this.searchQuery = '';
    this.filteredAuthors = [...this.allAuthors];
  }
  
  // Método para obtener la clase CSS según el estado del libro
  getStatusClass(status?: string): string {
    switch(status) {
      case 'en-progreso':
        return 'status-reading';
      case 'finalizado':
        return 'status-completed';
      case 'abandonado':
        return 'status-abandoned';
      case 'no-iniciado':
      default:
        return 'status-not-started';
    }
  }
  
  // Método para obtener el texto del estado
  getStatusText(status?: string): string {
    switch(status) {
      case 'en-progreso':
        return 'Leyendo';
      case 'finalizado':
        return 'Completado';
      case 'abandonado':
        return 'Abandonado';
      case 'no-iniciado':
      default:
        return 'No iniciado';
    }
  }
  
  // Obtener libros finalizados de un autor
  getFinishedBooks(author: Author): Book[] {
    return author.books.filter(book => book.estado === 'finalizado');
  }
  
  // Verificar si hay libros leídos o en progreso
  hasReadBooks(author: Author): boolean {
    return author.books.some(book => 
      book.estado === 'finalizado' || book.estado === 'en-progreso'
    );
  }
  
  // Obtener páginas totales de todos los libros de un autor
  getTotalPages(author: Author): number {
    return author.books.reduce((total, book) => 
      total + (book.paginasTotales || 0), 0
    );
  }
  
  // Obtener páginas leídas de todos los libros de un autor
  getReadPages(author: Author): number {
    return author.books.reduce((total, book) => 
      total + (book.paginasLeidas || 0), 0
    );
  }
  
  // Obtener valoración media de los libros de un autor
  getAverageRating(author: Author): string {
    const ratedBooks = author.books.filter(book => book.valoracion !== undefined);
    
    if (ratedBooks.length === 0) {
      return 'N/A';
    }
    
    const totalRating = ratedBooks.reduce((sum, book) => 
      sum + (book.valoracion || 0), 0
    );
    
    return (totalRating / ratedBooks.length).toFixed(1);
  }
}