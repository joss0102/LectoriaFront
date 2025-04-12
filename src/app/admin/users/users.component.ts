import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../core/services/user/user.service';
import { BookService } from '../../core/services/book/book.service';
import { Subscription } from 'rxjs';

// Interface para libro en la UI del usuario
interface UserBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string;
  status: string;
}

// Interface para autor en la UI del usuario
interface UserAuthor {
  id: number;
  name: string;
  imageUrl?: string;
  bookCount: number;
}

// Interface para estadísticas del usuario
interface UserStats {
  books: number;
  authors: number;
  pagesRead: number;
}

// Interface para usuario en la UI
interface UserDisplay {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
  status: string;
  joinDate: string;
  lastActive: string;
  stats: UserStats;
  books: UserBook[];
  authors: UserAuthor[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  // Propiedades para filtrado y búsqueda
  searchTerm: string = '';
  filterStatus: string = '';
  sortBy: string = 'name';
  
  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Propiedades para el modal y edición
  selectedUser: UserDisplay | null = null;
  currentView: 'details' | 'edit' | 'books' | 'authors' | 'stats' = 'details';
  editingUser: UserDisplay | null = null;
  showDeleteConfirmation: boolean = false;
  
  // Datos de usuarios
  users: UserDisplay[] = [];
  filteredUsers: UserDisplay[] = [];
  
  // Subscripciones
  private subscriptions: Subscription[] = [];
  
  constructor(
    private userService: UserService,
    private bookService: BookService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Método para cargar usuarios
  loadUsers(): void {
    const serviceUsers = this.userService.getAllUsers();
    this.users = serviceUsers.map(user => this.mapUserToDisplay(user));
    this.applyFilters();
  }

  // Mapear usuario del servicio al formato de UI
  private mapUserToDisplay(user: User): UserDisplay {
    // Generar un email a partir del nickname (simulado)
    const email = `${user.nickname.toLowerCase()}@example.com`;
    
    // Generar una fecha de última actividad (simulada)
    const lastActive = new Date().toISOString();
    
    // Determinar estado basado en el rol (simulado)
    let status: string;
    if (user.rol === 'admin') {
      status = 'Active';
    } else if (new Date(user.fechaRegistro).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      status = 'New'; // Si se registró en la última semana
    } else {
      status = 'Active';
    }
    
    // Obtener libros asociados (simulado)
    // En una implementación real, esto vendría de una relación usuario-libro en el backend
    const allBooks = this.bookService.getAllBooks();
    const userBooks: UserBook[] = [];
    const userAuthors: {[key: string]: UserAuthor} = {};
    
    // Para este ejemplo, asignaremos aleatoriamente algunos libros a cada usuario
    const numBooks = Math.floor(Math.random() * 5) + 1; // 1-5 libros por usuario
    const bookIndices = new Set<number>();
    
    while (bookIndices.size < numBooks && bookIndices.size < allBooks.length) {
      bookIndices.add(Math.floor(Math.random() * allBooks.length));
    }
    
    // Convertir los índices seleccionados a libros
    bookIndices.forEach(index => {
      const book = allBooks[index];
      const status = Math.random() > 0.5 ? 'Reading' : 'Completed';
      
      userBooks.push({
        id: index,
        title: book.titulo,
        author: book.autor,
        coverUrl: book.imagen || 'https://via.placeholder.com/150',
        status: status
      });
      
      // Añadir autor si no existe ya
      if (!userAuthors[book.autor]) {
        userAuthors[book.autor] = {
          id: Object.keys(userAuthors).length + 1,
          name: book.autor,
          bookCount: 1
        };
      } else {
        userAuthors[book.autor].bookCount++;
      }
    });
    
    // Calcular estadísticas
    const stats: UserStats = {
      books: userBooks.length,
      authors: Object.keys(userAuthors).length,
      pagesRead: userBooks.length * 300 // Estimación simple
    };
    
    return {
      id: user.id,
      name: `${user.nombre} ${user.primerApellido} ${user.segundoApellido}`.trim(),
      email: email,
      avatarUrl: user.imagenPerfil,
      status: status,
      joinDate: user.fechaRegistro,
      lastActive: lastActive,
      stats: stats,
      books: userBooks,
      authors: Object.values(userAuthors)
    };
  }

  // Métodos para filtrado y paginación
  applyFilters(): void {
    let result = [...this.users];
    
    // Filtrar por término de búsqueda
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (this.filterStatus !== '') {
      result = result.filter(user => user.status.toLowerCase() === this.filterStatus.toLowerCase());
    }
    
    // Ordenar
    result = this.sortUsers(result, this.sortBy);
    
    // Actualizar totales
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // Aplicar paginación
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredUsers = result.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  sortUsers(users: UserDisplay[], sortBy: string): UserDisplay[] {
    switch (sortBy) {
      case 'name':
        return users.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
      case 'books':
        return users.sort((a, b) => b.stats.books - a.stats.books);
      default:
        return users;
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }
  
  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
    this.sortBy = 'name';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Métodos para el modal de detalles
  openUserDetails(user: UserDisplay): void {
    this.selectedUser = user;
    this.currentView = 'details';
    this.editingUser = null;
  }
  
  closeCurrentModal(): void {
    if (this.currentView === 'edit' && this.editingUser) {
      // Mostrar confirmación si hay cambios sin guardar
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    
    this.selectedUser = null;
    this.currentView = 'details';
    this.editingUser = null;
    this.showDeleteConfirmation = false;
  }
  
  // Métodos para las diferentes vistas
  showUserBooks(): void {
    this.currentView = 'books';
  }
  
  showUserAuthors(): void {
    this.currentView = 'authors';
  }
  
  showUserStats(): void {
    this.currentView = 'stats';
  }
  
  backToDetails(): void {
    this.currentView = 'details';
  }
  
  getModalTitle(): string {
    if (!this.selectedUser) return 'User Details';
    
    switch (this.currentView) {
      case 'details': return 'User Details';
      case 'edit': return 'Edit User';
      case 'books': return `${this.selectedUser.name}'s Books`;
      case 'authors': return `${this.selectedUser.name}'s Authors`;
      case 'stats': return `${this.selectedUser.name}'s Statistics`;
      default: return 'User Details';
    }
  }
  
  // Métodos para edición
  toggleEditMode(): void {
    if (!this.selectedUser) return;
    
    this.currentView = 'edit';
    // Crear una copia para editar
    this.editingUser = JSON.parse(JSON.stringify(this.selectedUser));
  }
  
  cancelEdit(): void {
    this.currentView = 'details';
    this.editingUser = null;
  }
  
  saveUserChanges(): void {
    if (!this.editingUser) return;
    
    // En una aplicación real, aquí mapearíamos los cambios de vuelta al modelo de usuario
    // y llamaríamos al servicio para actualizarlo
    
    // Por ahora, simplemente actualizamos nuestra lista local
    const index = this.users.findIndex(user => user.id === this.editingUser!.id);
    if (index !== -1) {
      // Mantener las listas de libros y autores sin cambios
      const books = this.users[index].books;
      const authors = this.users[index].authors;
      
      this.users[index] = { 
        ...this.editingUser,
        books,
        authors
      };
      
      this.selectedUser = this.users[index];
    }
    
    this.currentView = 'details';
    this.editingUser = null;
    
    // Volver a aplicar filtros para actualizar la lista
    this.applyFilters();
  }

  // Métodos para eliminar usuario
  confirmDelete(): void {
    this.showDeleteConfirmation = true;
  }
  
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }
  
  deleteUser(): void {
    if (!this.selectedUser) return;
    
    // En una aplicación real, aquí llamaríamos al servicio para eliminar el usuario
    
    // Por ahora, simplemente actualizamos nuestra lista local
    this.users = this.users.filter(user => user.id !== this.selectedUser!.id);
    
    // Cerrar modales
    this.showDeleteConfirmation = false;
    this.selectedUser = null;
    
    // Actualizar la lista
    this.applyFilters();
  }
  
  // Método para abrir el modal de añadir usuario
  openAddUserModal(): void {
    // Crear un usuario vacío
    this.editingUser = {
      id: this.generateNewId(),
      name: '',
      email: '',
      status: 'New',
      joinDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
      stats: {
        books: 0,
        authors: 0,
        pagesRead: 0
      },
      books: [],
      authors: []
    };
    
    this.currentView = 'edit';
    this.selectedUser = null;
  }
  
  // Método para generar ID único
  generateNewId(): number {
    return Math.max(...this.users.map(user => user.id)) + 1;
  }
}