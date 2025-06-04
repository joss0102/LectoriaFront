import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminAuthorsService } from '../../../core/services/admin/admin-author.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { Author, AuthorUpdateRequest } from '../../../core/models/call-api/author.model';
import { User } from '../../../core/models/call-api/user.model';
import { Book, UserBook } from '../../../core/models/call-api/book.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

interface UserAuthor {
  user: User;
  authorBooks: UserBook[];
  editMode?: boolean;
  isSaving?: boolean;
}

@Component({
  selector: 'app-details-author',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './details-author.component.html',
  styleUrl: './details-author.component.scss'
})
export class DetailsAuthorComponent implements OnInit, OnDestroy {
  selectedAuthor: Author | null = null;
  originalAuthor: Author | null = null;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  error: string = '';
  isSaving: boolean = false;
  editMode: boolean = false;
  
  authorForm: FormGroup;
  authorBooks: Book[] = [];
  
  users: User[] = [];
  authorUsers: UserAuthor[] = [];
  selectedUserIndex: number = -1;
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private adminAuthorsService: AdminAuthorsService,
    private bookService: BookService,
    private userService: UserService,
    private authorService: AuthorService,
    private fb: FormBuilder
  ) {
    this.authorForm = this.createAuthorForm();
  }

  ngOnInit(): void {
    this.subscribeToAuthorSelection();
    this.subscribeToModalState();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Crea el formulario para el autor
   */
  createAuthorForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name1: [''],
      last_name2: [''],
      description: ['', [Validators.maxLength(1000)]]
    });
  }
  
  /**
   * Suscripción al autor seleccionado
   */
  subscribeToAuthorSelection(): void {
    const subscription = this.adminAuthorsService.getSelectedAuthor().subscribe(author => {
      this.selectedAuthor = author ? {...author} : null;
      this.originalAuthor = author ? {...author} : null;
      
      if (author) {
        this.updateAuthorForm(author);
        this.loadAuthorData(author.id);
      }
    });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Actualiza el formulario con los datos del autor
   */
  updateAuthorForm(author: Author): void {
    this.authorForm.patchValue({
      name: author.name || '',
      last_name1: author.last_name1 || '',
      last_name2: author.last_name2 || '',
      description: author.description || ''
    });
  }
  
  /**
   * Suscripción al estado del modal
   */
  subscribeToModalState(): void {
    const subscription = this.adminAuthorsService.getModalState().subscribe(state => {
      this.isModalOpen = state;
      if (!state) {
        this.editMode = false;
        this.selectedUserIndex = -1;
        if (this.selectedAuthor && this.originalAuthor) {
          this.selectedAuthor = {...this.originalAuthor};
        }
      }
    });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Cierra el modal de detalles
   */
  closeModal(): void {
    if (this.editMode && !confirm('¿Estás seguro de que deseas cerrar sin guardar los cambios?')) {
      return;
    }
    
    this.adminAuthorsService.closeModal();
    this.selectedUserIndex = -1;
    this.editMode = false;
  }
  
  /**
   * Activa el modo de edición
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (!this.editMode && this.selectedAuthor && this.originalAuthor) {
      this.selectedAuthor = {...this.originalAuthor};
      this.updateAuthorForm(this.originalAuthor);
    }
  }
  
  /**
   * Guarda los cambios del autor
   */
  saveChanges(): void {
    if (this.authorForm.invalid) {
      this.markFormGroupTouched(this.authorForm);
      return;
    }
    
    if (!this.selectedAuthor || !this.selectedAuthor.id) {
      this.error = 'No se puede guardar: ID de autor no válido';
      return;
    }
    
    this.isSaving = true;
    
    const formData = this.authorForm.value;
    const updateData: AuthorUpdateRequest = {
      name: formData.name.trim(),
      last_name1: formData.last_name1?.trim() || undefined,
      last_name2: formData.last_name2?.trim() || undefined,
      description: formData.description?.trim() || undefined
    };
    
    const subscription = this.authorService.updateAuthor(this.selectedAuthor.id, updateData)
      .pipe(
        finalize(() => this.isSaving = false),
        catchError(error => {
          console.error('Error al guardar los cambios:', error);
          this.error = 'No se pudieron guardar los cambios. Por favor, intenta de nuevo más tarde.';
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.originalAuthor = {...this.selectedAuthor, ...formData};
          this.selectedAuthor = {...this.selectedAuthor, ...formData};
          this.editMode = false;
          
          alert('Autor actualizado correctamente');
        }
      });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Marca todos los campos del formulario como tocados para mostrar validaciones
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  /**
   * Carga los datos del autor (libros y usuarios)
   */
  loadAuthorData(authorId: number): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = forkJoin({
      users: this.userService.getAllUsers().pipe(
        catchError(error => {
          console.error('Error al cargar usuarios:', error);
          return of({ data: [] as User[] });
        })
      ),
      books: this.bookService.getAllBooks(1, 1000).pipe(
        catchError(error => {
          console.error('Error al cargar libros:', error);
          return of({ data: [] as Book[] });
        })
      )
    }).pipe(
      switchMap(response => {
        this.users = response.users.data;
        const allBooks = response.books.data;
        
        const authorFullName = this.getAuthorFullName(this.selectedAuthor!);
        this.authorBooks = allBooks.filter(book => 
          book.authors?.toLowerCase().includes(authorFullName.toLowerCase())
        );
        
        const userObservables = this.users.map(user => 
          this.bookService.getUserBooks(user.nickName).pipe(
            map(response => {
              const authorBooksForUser = response.data.filter(userBook => 
                this.authorBooks.some(authorBook => authorBook.book_id === userBook.book_id)
              );
              
              if (authorBooksForUser.length > 0) {
                const enrichedBooks = authorBooksForUser.map(userBook => {
                  const fullBook = this.authorBooks.find(ab => ab.book_id === userBook.book_id);
                  return {
                    ...userBook,
                    sagas: fullBook?.sagas
                  };
                });
                
                return { 
                  user, 
                  authorBooks: enrichedBooks,
                  editMode: false,
                  isSaving: false
                } as UserAuthor;
              }
              return null;
            }),
            catchError(() => of(null))
          )
        );
        
        return forkJoin(userObservables);
      }),
      finalize(() => this.isLoading = false),
      catchError(error => {
        console.error('Error al cargar datos del autor:', error);
        this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe(results => {
      this.authorUsers = results.filter(result => result !== null) as UserAuthor[];
    });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Selecciona un usuario para ver detalles
   */
  selectUser(index: number): void {
    if (this.selectedUserIndex === index) {
      this.selectedUserIndex = -1;
      return;
    }
    
    this.selectedUserIndex = index;
  }
  
  /**
   * Obtiene el nombre completo del autor
   */
  getAuthorFullName(author: Author): string {
    if (!author) return '';
    return `${author.name} ${author.last_name1 || ''} ${author.last_name2 || ''}`.trim();
  }
  
  /**
   * Obtiene la URL de la imagen del autor
   */
  getAuthorImageUrl(author: Author | null): string {
    if (!author) {
      return '/autores/fondo-default.jpg';
    }
    
    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }
  
  /**
   * Obtiene la URL de la imagen de usuario
   */
  getUserImageUrl(nickname: string): string {
    return `/usuarios/${nickname}.png`;
  }
  
  /**
   * Obtiene la URL de la imagen del libro desde un Book completo
   */
  getBookImageFromFullBook(book: Book): string {
    if (!book) {
      return '/libros/default.png';
    }
    
    if (book.sagas) {
      return `/libros/${book.sagas}/covers/${book.book_title}.png`;
    } else {
      return '/libros/default.png';
    }
  }
  
  /**
   * Obtiene la URL de la imagen del libro
   */
  getBookImageUrl(book: UserBook): string {
    if (!book) {
      return '/libros/default.png';
    }
    
    const fullBook = this.authorBooks.find(ab => ab.book_id === book.book_id);
    if (fullBook && fullBook.sagas) {
      return `/libros/${fullBook.sagas}/covers/${book.book_title}.png`;
    } else {
      return '/libros/default.png';
    }
  }
  
  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target.src.includes('/autores/')) {
      target.src = '/autores/fondo-default.jpg';
    } else if (target.src.includes('/usuarios/')) {
      target.src = '/usuarios/default.png';
    } else {
      target.src = '/libros/default.png';
    }
  }
  
  /**
   * Formatea una fecha para mostrarla
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  }
  
  /**
   * Obtiene el estado de lectura formateado
   */
  getReadingStatus(status: string): string {
    switch(status) {
      case 'reading': return 'Leyendo';
      case 'completed': return 'Completado';
      case 'dropped': return 'Abandonado';
      case 'on_hold': return 'En pausa';
      case 'plan_to_read': return 'Por leer';
      default: return status;
    }
  }
  
  /**
   * Obtiene estadísticas del autor
   */
  getAuthorStats(): any {
    const totalBooks = this.authorBooks.length;
    const totalUsers = this.authorUsers.length;
    const totalBooksInLibraries = this.authorUsers.reduce((sum, userAuthor) => 
      sum + userAuthor.authorBooks.length, 0
    );
    
    return {
      totalBooks,
      totalUsers,
      totalBooksInLibraries
    };
  }
}