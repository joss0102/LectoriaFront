import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book/book.service';
import { Subscription } from 'rxjs';
import { Book } from '../../core/models/book-model';

interface AuthorBook {
  id: number;
  title: string;
  coverUrl: string;
  year: string;
  genres?: string[];
}

interface RegisteredUser {
  id: number;
  name: string;
  avatarUrl: string;
  bookCount: number;
}

interface Author {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
  books: AuthorBook[];
  registeredUsers: RegisteredUser[];
}

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authors.component.html',
  styleUrls: ['./authors.component.scss']
})
export class AuthorsComponent implements OnInit, OnDestroy {
  // Propiedades para filtrado y búsqueda
  searchTerm: string = '';
  sortBy: string = 'name';
  
  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Propiedades para el modal y edición
  selectedAuthor: Author | null = null;
  isEditingAuthor: boolean = false;
  editingAuthor: Author | null = null;
  showDeleteConfirmation: boolean = false;
  
  // Datos de ejemplo (se reemplazarán con datos de API)
  authors: Author[] = [];
  filteredAuthors: Author[] = [];
  
  // Subscripciones
  private subscriptions: Subscription[] = [];
  
  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.loadAuthors();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método para extraer autores únicos de los libros
  loadAuthors(): void {
    const books = this.bookService.getAllBooks();
    const authorsMap = new Map<string, Book[]>();
    
    // Agrupar libros por autor
    books.forEach(book => {
      if (!authorsMap.has(book.autor)) {
        authorsMap.set(book.autor, []);
      }
      authorsMap.get(book.autor)!.push(book);
    });
    
    // Convertir a nuestro modelo de autor
    let authorId = 1;
    this.authors = Array.from(authorsMap.entries()).map(([authorName, authorBooks]) => {
      // Para simplificar, asumimos que el nombre del autor tiene formato "Nombre Apellido"
      const nameParts = authorName.split(' ');
      const firstName = nameParts.length > 0 ? nameParts[0] : '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Crear libros del autor
      const books: AuthorBook[] = authorBooks.map((book, index) => ({
        id: index + 1,
        title: book.titulo,
        genres: book.generos,
        coverUrl: book.imagen || 'https://via.placeholder.com/150',
        year: book.fechaInicio 
          ? new Date(book.fechaInicio).getFullYear().toString() 
          : '2024'
      }));
      
      // Crear usuarios registrados (simulado)
      const registeredUsers: RegisteredUser[] = books.length > 2 
        ? [
            { 
              id: 1, 
              name: 'Reader Fan', 
              avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg', 
              bookCount: Math.min(books.length, 3) 
            }
          ]
        : [];
      
      return {
        id: authorId++,
        firstName: firstName,
        lastName: lastName,
        imageUrl: this.getAuthorImage(authorName),
        biography: `${authorName} es un reconocido autor de ${books[0].genres?.join(', ') || 'fantasía'} con ${books.length} obras en su bibliografía.`,
        nationality: 'Español', // Valor por defecto
        books: books,
        registeredUsers: registeredUsers
      };
    });
    
    this.applyFilters();
  }
  
  // Método para generar URLs de imágenes de autores (simulado)
  getAuthorImage(authorName: string): string {
    // Imágenes de muestra para algunos autores
    const authorImages: {[key: string]: string} = {
      'Sarah J. Maas': 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Sarah_J._Maas_%2851452892398%29_%28cropped_2%29.jpg',
      'Brandon Sanderson': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Brandon_Sanderson_-_Lucca_Comics_%26_Games_2016.jpg',
      'Jay Kristoff': 'https://upload.wikimedia.org/wikipedia/commons/5/57/Jay_Kristoff_-_Fahrenheit_2018_-_1_%28cropped%29.jpg'
    };
    
    return authorImages[authorName] || 'https://via.placeholder.com/150?text=Author';
  }

  // Métodos para filtrado y paginación
  applyFilters(): void {
    let result = [...this.authors];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(author => 
        author.firstName.toLowerCase().includes(term) || 
        author.lastName.toLowerCase().includes(term)
      );
    }
    
    // Ordenar
    result = this.sortAuthors(result, this.sortBy);
    
    // Actualizar totales
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredAuthors = result.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  sortAuthors(authors: Author[], sortBy: string): Author[] {
    switch (sortBy) {
      case 'name':
        return authors.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case 'books':
        return authors.sort((a, b) => b.books.length - a.books.length);
      case 'popular':
        return authors.sort((a, b) => b.registeredUsers.length - a.registeredUsers.length);
      default:
        return authors;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'name';
    this.currentPage = 1;
    this.applyFilters();
  }
  
  // Métodos para el modal de detalles
  openAuthorDetails(author: Author): void {
    this.selectedAuthor = author;
    this.isEditingAuthor = false;
    this.editingAuthor = null;
  }
  
  closeAuthorDetails(): void {
    if (this.isEditingAuthor) {
      // Mostrar confirmación si hay cambios sin guardar
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    
    this.selectedAuthor = null;
    this.isEditingAuthor = false;
    this.editingAuthor = null;
  }
  
  // Métodos para edición
  toggleEditMode(): void {
    if (!this.selectedAuthor) return;
    
    this.isEditingAuthor = true;
    // Crear una copia para editar
    this.editingAuthor = JSON.parse(JSON.stringify(this.selectedAuthor));
  }
  
  cancelEdit(): void {
    this.isEditingAuthor = false;
    this.editingAuthor = null;
  }
  
  saveAuthorChanges(): void {
    if (!this.editingAuthor) return;
    
    // Actualizar el autor en la lista
    const index = this.authors.findIndex(author => author.id === this.editingAuthor!.id);
    if (index !== -1) {
      this.authors[index] = { ...this.editingAuthor };
      this.selectedAuthor = this.authors[index];
    }
    
    this.isEditingAuthor = false;
    this.editingAuthor = null;
    
    // Volver a aplicar filtros para actualizar la lista
    this.applyFilters();
  }
  
  // Métodos para eliminar autor
  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }
  
  deleteAuthor(): void {
    if (!this.selectedAuthor) return;
    
    // Eliminar autor
    this.authors = this.authors.filter(author => author.id !== this.selectedAuthor!.id);
    
    // Cerrar modales
    this.showDeleteConfirmation = false;
    this.selectedAuthor = null;
    
    // Actualizar la lista
    this.applyFilters();
  }
  
  // Método para abrir el modal de añadir autor
  openAddAuthorModal(): void {
    // Crear un autor vacío
    this.editingAuthor = {
      id: this.generateNewId(),
      firstName: '',
      lastName: '',
      books: [],
      registeredUsers: []
    };
    
    this.isEditingAuthor = true;
    this.selectedAuthor = null;
  }
  
  // Método para generar ID único
  generateNewId(): number {
    return Math.max(...this.authors.map(author => author.id)) + 1;
  }
}