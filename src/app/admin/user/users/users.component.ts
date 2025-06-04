import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { finalize, catchError, map, switchMap } from 'rxjs/operators';

import { BookService } from '../../../core/services/call-api/book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { AdminUsersService } from '../../../core/services/admin/admin-user.service';

import { AddUserComponent } from '../add-user/add-user.component';
import { DetailsUserComponent } from '../details-user/details-user.component';

import { User } from '../../../core/models/call-api/user.model';
interface AdminUser extends User {
  age?: string;
  total_books?: number;
  unique_authors?: number;
  is_active?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  type: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    AddUserComponent, 
    DetailsUserComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, OnDestroy {
  users: AdminUser[] = [];
  displayedUsers: AdminUser[] = [];
  selectedUsers: number[] = [];
  
  searchQuery: string = '';
  activeFilters: FilterOption[] = [];
  
  filterBooksMin: number | null = null;
  filterBooksMax: number | null = null;
  filterAuthorsMin: number | null = null;
  filterAuthorsMax: number | null = null;
  filterAgeMin: number | null = null;
  filterAgeMax: number | null = null;
  filterRole: string = '';
  filterStatus: string = '';
  
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  
  isLoading: boolean = true;
  error: string = '';
  
  isFiltersSidebarOpen: boolean = false;
  isAddUserSidebarOpen: boolean = false;
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private userService: UserService,
    private readingService: ReadingService,
    private adminUsersService: AdminUsersService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Carga datos iniciales (usuarios)
   */
  loadInitialData(): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = this.loadUsers().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe();
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Carga los usuarios con información estadística
   */
  loadUsers(): any {
    this.isLoading = true;
    
    return this.userService.getAllUsers()
      .pipe(
        catchError(error => {
          console.error('Error al cargar los usuarios:', error);
          this.error = 'No se pudieron cargar los usuarios. Por favor, intenta de nuevo más tarde.';
          this.isLoading = false;
          return of({ data: [] });
        }),
        switchMap(response => {
          if (response.data.length === 0) {
            this.users = [];
            this.displayedUsers = [];
            this.isLoading = false;
            return of([]);
          }
          
          const adminUsers: AdminUser[] = response.data.map(user => ({
            ...user,
            age: this.calculateAge(user.birthdate),
            total_books: 0,
            unique_authors: 0,
            is_active: true
          }));
          
          const userStatsObservables = adminUsers.map(user => 
            this.bookService.getUserBooks(user.nickName,undefined,1,1000).pipe(
              switchMap(userBooksResponse => {
                const userBooks = userBooksResponse.data;
                user.total_books = userBooks.length;
                
                if (userBooks.length === 0) {
                  user.unique_authors = 0;
                  return of(user);
                }
                
                const bookIds = userBooks.map(ub => ub.book_id);
                return this.bookService.getBooksWithCache(bookIds).pipe(
                  map(books => {
                    const authorsSet = new Set<string>();
                    books.forEach(book => {
                      if (book.authors) {
                        const authors = book.authors.split(',').map(a => a.trim());
                        authors.forEach(author => authorsSet.add(author.toLowerCase()));
                      }
                    });
                    user.unique_authors = authorsSet.size;
                    return user;
                  })
                );
              }),
              catchError(() => {
                user.total_books = 0;
                user.unique_authors = 0;
                return of(user);
              })
            )
          );
          
          return forkJoin(userStatsObservables);
        }),
        map(users => {
          this.users = users;
          this.displayedUsers = [...this.users];
          this.totalItems = this.users.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.applyFiltersAndSort();
          this.isLoading = false;
          return users;
        })
      );
  }
  
/**
 * Calcula la edad y devuelve fecha formateada
 */
calculateAge(birthdate: string | undefined): string {
  if (!birthdate) return 'No especificada';
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    
    const day = birth.getDate().toString().padStart(2, '0');
    const month = months[birth.getMonth()];
    const year = birth.getFullYear();
    
    return `${day} de ${month} del ${year} (${age} años)`;
  } catch (error) {
    return 'Fecha inválida';
  }
}
  
  /**
   * Abre el sidebar de filtros
   */
  openFiltersSidebar(): void {
    this.isFiltersSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Cierra el sidebar de filtros
   */
  closeFiltersSidebar(): void {
    this.isFiltersSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Abre el sidebar para añadir un usuario
   */
  addNewUser(): void {
    this.isAddUserSidebarOpen = true;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el sidebar de añadir usuario
   */
  closeAddUserSidebar(): void {
    this.isAddUserSidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Maneja el evento cuando se añade un usuario nuevo
   */
  onUserAdded(): void {
    this.closeAddUserSidebar();
    this.currentPage = 1;
    const subscription = this.loadUsers().subscribe();
    this.subscriptions.push(subscription);
  }
  
  /**
   * Resetea todos los filtros
   */
  resetFilters(): void {
    this.filterBooksMin = null;
    this.filterBooksMax = null;
    this.filterAuthorsMin = null;
    this.filterAuthorsMax = null;
    this.filterAgeMin = null;
    this.filterAgeMax = null;
    this.filterRole = '';
    this.filterStatus = '';
  }
  
  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    this.activeFilters = [];
    
    if (this.filterBooksMin !== null || this.filterBooksMax !== null) {
      let booksLabel = 'Libros: ';
      
      if (this.filterBooksMin !== null && this.filterBooksMax !== null) {
        booksLabel += `${this.filterBooksMin} a ${this.filterBooksMax}`;
      } else if (this.filterBooksMin !== null) {
        booksLabel += `Mín. ${this.filterBooksMin}`;
      } else if (this.filterBooksMax !== null) {
        booksLabel += `Máx. ${this.filterBooksMax}`;
      }
      
      this.activeFilters.push({
        id: 'books',
        label: booksLabel,
        value: `${this.filterBooksMin || 0}-${this.filterBooksMax || 9999}`,
        type: 'books'
      });
    }
    
    if (this.filterAuthorsMin !== null || this.filterAuthorsMax !== null) {
      let authorsLabel = 'Autores: ';
      
      if (this.filterAuthorsMin !== null && this.filterAuthorsMax !== null) {
        authorsLabel += `${this.filterAuthorsMin} a ${this.filterAuthorsMax}`;
      } else if (this.filterAuthorsMin !== null) {
        authorsLabel += `Mín. ${this.filterAuthorsMin}`;
      } else if (this.filterAuthorsMax !== null) {
        authorsLabel += `Máx. ${this.filterAuthorsMax}`;
      }
      
      this.activeFilters.push({
        id: 'authors',
        label: authorsLabel,
        value: `${this.filterAuthorsMin || 0}-${this.filterAuthorsMax || 9999}`,
        type: 'authors'
      });
    }
    
    if (this.filterAgeMin !== null || this.filterAgeMax !== null) {
      let ageLabel = 'Edad: ';
      
      if (this.filterAgeMin !== null && this.filterAgeMax !== null) {
        ageLabel += `${this.filterAgeMin} a ${this.filterAgeMax} años`;
      } else if (this.filterAgeMin !== null) {
        ageLabel += `Mín. ${this.filterAgeMin} años`;
      } else if (this.filterAgeMax !== null) {
        ageLabel += `Máx. ${this.filterAgeMax} años`;
      }
      
      this.activeFilters.push({
        id: 'age',
        label: ageLabel,
        value: `${this.filterAgeMin || 0}-${this.filterAgeMax || 150}`,
        type: 'age'
      });
    }
    
    if (this.filterRole) {
      this.activeFilters.push({
        id: 'role',
        label: `Rol: ${this.filterRole === 'admin' ? 'Administrador' : 'Cliente'}`,
        value: this.filterRole,
        type: 'role'
      });
    }
    
    if (this.filterStatus) {
      this.activeFilters.push({
        id: 'status',
        label: `Estado: ${this.filterStatus === 'active' ? 'Activo' : 'Inactivo'}`,
        value: this.filterStatus,
        type: 'status'
      });
    }
    
    this.applyFiltersAndSort();
    this.closeFiltersSidebar();
  }
  
  /**
   * Elimina un filtro activo
   */
  removeFilter(filterId: string): void {
    const index = this.activeFilters.findIndex(filter => filter.id === filterId);
    
    if (index !== -1) {
      const filter = this.activeFilters[index];
      
      if (filter.type === 'books') {
        this.filterBooksMin = null;
        this.filterBooksMax = null;
      } else if (filter.type === 'authors') {
        this.filterAuthorsMin = null;
        this.filterAuthorsMax = null;
      } else if (filter.type === 'age') {
        this.filterAgeMin = null;
        this.filterAgeMax = null;
      } else if (filter.type === 'role') {
        this.filterRole = '';
      } else if (filter.type === 'status') {
        this.filterStatus = '';
      }
      
      this.activeFilters.splice(index, 1);
      this.applyFiltersAndSort();
    }
  }
  
  /**
   * Busca usuarios por consulta global
   */
  searchGlobalUsers(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
  
  /**
   * Limpia la búsqueda y filtros
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.activeFilters = [];
    this.resetFilters();
    
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
  
  /**
   * Cambia a la página especificada
   */
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    
    this.currentPage = page;
    this.applyFiltersAndSort();
  }
  
  /**
   * Obtiene los números de página a mostrar
   */
  getPageNumbers(): number[] {
    const displayedPages = [];
    
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        displayedPages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          displayedPages.push(i);
        }
      } else if (this.currentPage >= this.totalPages - 2) {
        for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
          displayedPages.push(i);
        }
      } else {
        for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
          displayedPages.push(i);
        }
      }
    }
    
    return displayedPages;
  }
  
  /**
   * Cambia el tamaño de página
   */
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }
  
  /**
   * Obtiene la URL de la imagen del usuario
   */
  getUserImageUrl(user: AdminUser): string {
    return `/usuarios/${user.nickName}.png`;
  }
  
  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/usuarios/default.png';
  }
  
  /**
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(user: AdminUser): string {
    return `${user.name} ${user.last_name1 || ''} ${user.last_name2 || ''}`.trim();
  }
  
  /**
   * Selecciona o deselecciona un usuario
   */
  toggleUserSelection(userId: number): void {
    const index = this.selectedUsers.indexOf(userId);
    if (index === -1) {
      this.selectedUsers.push(userId);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }
  
  /**
   * Verifica si un usuario está seleccionado
   */
  isSelected(userId: number): boolean {
    return this.selectedUsers.includes(userId);
  }
  
  /**
   * Selecciona o deselecciona todos los usuarios
   */
  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      this.selectedUsers = this.displayedUsers.map(user => user.id);
    } else {
      this.selectedUsers = [];
    }
  }
  
  /**
   * Verifica si todos los usuarios están seleccionados
   */
  isAllSelected(): boolean {
    return this.displayedUsers.length > 0 && 
            this.displayedUsers.every(user => this.selectedUsers.includes(user.id));
  }
  
  /**
   * Aplica filtros y ordenación
   */
  private applyFiltersAndSort(): void {
    let filteredUsers = [...this.users];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.nickName.toLowerCase().includes(query) ||
        this.getUserFullName(user).toLowerCase().includes(query) ||
        user.age?.toLowerCase().includes(query)
      );
    }
    
    const booksFilter = this.activeFilters.find(f => f.type === 'books');
    if (booksFilter) {
      const [minBooks, maxBooks] = booksFilter.value.split('-').map(Number);
      
      filteredUsers = filteredUsers.filter(user => {
        const books = user.total_books || 0;
        return books >= minBooks && books <= maxBooks;
      });
    }
    
    const authorsFilter = this.activeFilters.find(f => f.type === 'authors');
    if (authorsFilter) {
      const [minAuthors, maxAuthors] = authorsFilter.value.split('-').map(Number);
      
      filteredUsers = filteredUsers.filter(user => {
        const authors = user.unique_authors || 0;
        return authors >= minAuthors && authors <= maxAuthors;
      });
    }
    
    const ageFilter = this.activeFilters.find(f => f.type === 'age');
    if (ageFilter) {
      const [minAge, maxAge] = ageFilter.value.split('-').map(Number);
      
      filteredUsers = filteredUsers.filter(user => {
        const ageMatch = user.age?.match(/\((\d+) años\)/);
        const age = ageMatch ? parseInt(ageMatch[1]) : 0;
        return age >= minAge && age <= maxAge;
      });
    }
    
    const roleFilter = this.activeFilters.find(f => f.type === 'role');
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(user => 
        user.role_name === roleFilter.value
      );
    }
    
    const statusFilter = this.activeFilters.find(f => f.type === 'status');
    if (statusFilter) {
      const isActive = statusFilter.value === 'active';
      filteredUsers = filteredUsers.filter(user => 
        user.is_active === isActive
      );
    }
    
    this.totalItems = filteredUsers.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsers = filteredUsers.slice(startIndex, endIndex);
  }
  
  /**
   * Muestra los detalles de un usuario
   */
  viewUserDetails(user: AdminUser): void {
    this.adminUsersService.setSelectedUser(user);
  }
  
  /**
   * Desactiva un usuario
   */
  deactivateUser(userId: number): void {
    if (confirm('¿Estás seguro de que deseas desactivar este usuario?')) {
      console.log('Desactivar usuario:', userId);
      alert('Funcionalidad de desactivación pendiente de implementar en el backend');
    }
  }
  
  /**
   * Desactiva los usuarios seleccionados
   */
  deactivateSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      return;
    }
    
    if (confirm(`¿Estás seguro de que deseas desactivar ${this.selectedUsers.length} usuarios seleccionados?`)) {
      console.log('Desactivar usuarios:', this.selectedUsers);
      alert('Funcionalidad de desactivación masiva pendiente de implementar en el backend');
      this.selectedUsers = [];
    }
  }
  
  /**
   * Exporta los datos de los usuarios
   */
  exportUsers(): void {
    const headers = ['ID', 'Nickname', 'Nombre', 'Apellido 1', 'Apellido 2', 'Fecha Nacimiento', 'Edad', 'Fecha Registro', 'Rol', 'Libros', 'Autores', 'Estado'];
    const csv = [
      headers.join(','),
      ...this.users.map(user => [
        user.id,
        `"${user.nickName.replace(/"/g, '""')}"`,
        `"${user.name.replace(/"/g, '""')}"`,
        `"${(user.last_name1 || '').replace(/"/g, '""')}"`,
        `"${(user.last_name2 || '').replace(/"/g, '""')}"`,
        user.birthdate || '',
        `"${(user.age || '').replace(/"/g, '""')}"`,
        user.union_date || '',
        user.role_name || '',
        user.total_books || 0,
        user.unique_authors || 0,
        user.is_active ? 'Activo' : 'Inactivo'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}