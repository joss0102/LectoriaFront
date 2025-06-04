import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminUsersService } from '../../../core/services/admin/admin-user.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { User, UserUpdateRequest } from '../../../core/models/call-api/user.model';
import { Book, UserBook, UserBookUpdateRequest } from '../../../core/models/call-api/book.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

interface AdminUser extends User {
  age?: string;
  total_books?: number;
  unique_authors?: number;
  is_active?: boolean;
}

interface BookDetail {
  userBook: UserBook;
  book?: Book;
  readingProgress?: any[];
  review?: any;
  phrases?: any[];
  notes?: any[];
  editMode?: boolean;
  bookForm?: FormGroup;
  phrasesEditMode?: boolean;
  notesEditMode?: boolean;
  isSaving?: boolean;
}

@Component({
  selector: 'app-details-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './details-user.component.html',
  styleUrl: './details-user.component.scss'
})
export class DetailsUserComponent implements OnInit, OnDestroy {
  selectedUser: AdminUser | null = null;
  originalUser: AdminUser | null = null;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  error: string = '';
  isSaving: boolean = false;
  editMode: boolean = false;
  
  userForm: FormGroup;
  today = new Date().toISOString().split('T')[0];
  
  userBooks: BookDetail[] = [];
  filteredBooks: BookDetail[] = [];
  selectedBookIndex: number = -1;
  selectedStatusFilter: string = 'all';
  
  readingStatuses: {value: string, label: string}[] = [
    {value: 'reading', label: 'Leyendo'},
    {value: 'completed', label: 'Completado'},
    {value: 'dropped', label: 'Abandonado'},
    {value: 'on_hold', label: 'En pausa'},
    {value: 'plan_to_read', label: 'Por leer'}
  ];
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private adminUsersService: AdminUsersService,
    private bookService: BookService,
    private userService: UserService,
    private readingService: ReadingService,
    private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.subscribeToUserSelection();
    this.subscribeToModalState();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Crea el formulario para el usuario
   */
  createUserForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name1: [''],
      last_name2: [''],
      birthdate: [''],
      role_name: ['client', [Validators.required]]
    });
  }
  
  /**
   * Crea el formulario para un libro del usuario
   */
  createBookForm(bookDetail: BookDetail): FormGroup {
    const form = this.fb.group({
      reading_status: [bookDetail.userBook?.reading_status || ''],
      date_added: [bookDetail.userBook?.date_added || ''],
      date_start: [bookDetail.userBook?.date_start || ''],
      date_ending: [bookDetail.userBook?.date_ending || ''],
      
      review: this.fb.group({
        rating: [bookDetail.review?.rating || 0, [Validators.min(0), Validators.max(10)]],
        review_text: [bookDetail.review?.review_text || '']
      }),
      
      phrases: this.fb.array([]),
      
      notes: this.fb.array([])
    });
    
    if (bookDetail.phrases && bookDetail.phrases.length > 0) {
      const phrasesArray = form.get('phrases') as FormArray;
      bookDetail.phrases.forEach(phrase => {
        phrasesArray.push(this.fb.group({
          id: [phrase.id],
          text: [phrase.text, Validators.required]
        }));
      });
    }
    
    if (bookDetail.notes && bookDetail.notes.length > 0) {
      const notesArray = form.get('notes') as FormArray;
      bookDetail.notes.forEach(note => {
        notesArray.push(this.fb.group({
          id: [note.id],
          text: [note.text, Validators.required]
        }));
      });
    }
    
    return form;
  }
  
  /**
   * Helper para obtener las frases como FormArray
   */
  getPhrases(bookForm: FormGroup): FormArray {
    return bookForm.get('phrases') as FormArray;
  }
  
  /**
   * Helper para obtener las notas como FormArray
   */
  getNotes(bookForm: FormGroup): FormArray {
    return bookForm.get('notes') as FormArray;
  }
  
  /**
   * Añade una nueva frase al formulario
   */
  addPhrase(bookDetail: BookDetail): void {
    const phrases = this.getPhrases(bookDetail.bookForm!);
    phrases.push(this.fb.group({
      id: [null],
      text: ['', Validators.required]
    }));
  }
  
  /**
   * Elimina una frase del formulario
   */
  removePhrase(bookDetail: BookDetail, index: number): void {
    const phrases = this.getPhrases(bookDetail.bookForm!);
    
    const phraseGroup = phrases.at(index) as FormGroup;
    const phraseId = phraseGroup.get('id')?.value;
    
    if (phraseId) {
      if (confirm('¿Estás seguro de eliminar esta frase? Esta acción no se puede deshacer.')) {
        this.readingService.deletePhrase(phraseId).subscribe(
          () => {
            phrases.removeAt(index);
            if (bookDetail.phrases) {
              bookDetail.phrases = bookDetail.phrases.filter(p => p.id !== phraseId);
            }
          },
          error => {
            console.error('Error al eliminar la frase:', error);
            alert('Error al eliminar la frase. Por favor, intenta de nuevo.');
          }
        );
      }
    } else {
      phrases.removeAt(index);
    }
  }
  
  /**
   * Añade una nueva nota al formulario
   */
  addNote(bookDetail: BookDetail): void {
    const notes = this.getNotes(bookDetail.bookForm!);
    notes.push(this.fb.group({
      id: [null],
      text: ['', Validators.required]
    }));
  }
  
  /**
   * Elimina una nota del formulario
   */
  removeNote(bookDetail: BookDetail, index: number): void {
    const notes = this.getNotes(bookDetail.bookForm!);
    
    const noteGroup = notes.at(index) as FormGroup;
    const noteId = noteGroup.get('id')?.value;
    
    if (noteId) {
      if (confirm('¿Estás seguro de eliminar esta nota? Esta acción no se puede deshacer.')) {
        this.readingService.deleteNote(noteId).subscribe(
          () => {
            notes.removeAt(index);
            if (bookDetail.notes) {
              bookDetail.notes = bookDetail.notes.filter(n => n.id !== noteId);
            }
          },
          error => {
            console.error('Error al eliminar la nota:', error);
            alert('Error al eliminar la nota. Por favor, intenta de nuevo.');
          }
        );
      }
    } else {
      notes.removeAt(index);
    }
  }

  /**
   * Suscripción al usuario seleccionado
   */
  subscribeToUserSelection(): void {
    const subscription = this.adminUsersService.getSelectedUser().subscribe(user => {
      this.selectedUser = user ? {...user} as AdminUser : null;
      this.originalUser = user ? {...user} as AdminUser : null;
      
      if (user) {
        this.updateUserForm(user as AdminUser);
        this.loadUserData(user.nickName);
      }
    });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Actualiza el formulario con los datos del usuario
   */
  updateUserForm(user: AdminUser): void {
    this.userForm.patchValue({
      name: user.name || '',
      last_name1: user.last_name1 || '',
      last_name2: user.last_name2 || '',
      birthdate: user.birthdate || '',
      role_name: user.role_name || 'client'
    });
  }
  
  /**
   * Suscripción al estado del modal
   */
  subscribeToModalState(): void {
    const subscription = this.adminUsersService.getModalState().subscribe(state => {
      this.isModalOpen = state;
      if (!state) {
        this.editMode = false;
        this.selectedBookIndex = -1;
        this.selectedStatusFilter = 'all';
        if (this.selectedUser && this.originalUser) {
          this.selectedUser = {...this.originalUser};
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
    
    this.adminUsersService.closeModal();
    this.selectedBookIndex = -1;
    this.editMode = false;
  }
  
  /**
   * Activa el modo de edición
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (!this.editMode && this.selectedUser && this.originalUser) {
      this.selectedUser = {...this.originalUser};
      this.updateUserForm(this.originalUser);
    }
    
    if (!this.editMode) {
      this.userBooks.forEach(book => {
        book.editMode = false;
        book.phrasesEditMode = false;
        book.notesEditMode = false;
      });
    }
  }
  
  /**
   * Guarda los cambios del usuario
   */
  saveChanges(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }
    
    if (!this.selectedUser || !this.selectedUser.id) {
      this.error = 'No se puede guardar: ID de usuario no válido';
      return;
    }
    
    this.isSaving = true;
    
    const formData = this.userForm.value;
    const updateData: UserUpdateRequest = {
      name: formData.name.trim(),
      last_name1: formData.last_name1?.trim() || undefined,
      last_name2: formData.last_name2?.trim() || undefined,
      birthdate: formData.birthdate || undefined,
      role_name: formData.role_name
    };
    
    const subscription = this.userService.updateUser(this.selectedUser.id.toString(), updateData)
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
          this.originalUser = {...this.selectedUser, ...formData};
          this.selectedUser = {...this.selectedUser, ...formData};
          this.editMode = false;
          
          alert('Usuario actualizado correctamente');
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
   * Carga los datos del usuario (libros y detalles)
   */
  loadUserData(nickname: string): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = this.bookService.getUserBooks(nickname, undefined, 1, 1000)
      .pipe(
        switchMap(userBooksResponse => {
          const userBooks = userBooksResponse.data;
          
          if (userBooks.length === 0) {
            this.userBooks = [];
            this.filteredBooks = [];
            this.isLoading = false;
            return of([]);
          }
          
          const bookIds = userBooks.map(ub => ub.book_id);
          return this.bookService.getBooksWithCache(bookIds).pipe(
            map(books => {
              const bookDetails: BookDetail[] = userBooks.map(userBook => {
                const fullBook = books.find(b => b.book_id === userBook.book_id);
                return {
                  userBook,
                  book: fullBook,
                  editMode: false,
                  phrasesEditMode: false,
                  notesEditMode: false,
                  isSaving: false
                };
              });
              
              return bookDetails;
            })
          );
        }),
        finalize(() => this.isLoading = false),
        catchError(error => {
          console.error('Error al cargar datos del usuario:', error);
          this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.';
          return of([]);
        })
      )
      .subscribe(bookDetails => {
        this.userBooks = bookDetails;
        this.filterBooksByStatus('all');
      });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Filtra los libros por estado
   */
  filterBooksByStatus(status: string): void {
    this.selectedStatusFilter = status;
    
    if (status === 'all') {
      this.filteredBooks = [...this.userBooks];
    } else {
      this.filteredBooks = this.userBooks.filter(book => 
        book.userBook.reading_status === status
      );
    }
  }
  
  /**
   * Obtiene libros por estado específico
   */
  getBooksByStatus(status: string): BookDetail[] {
    return this.userBooks.filter(book => book.userBook.reading_status === status);
  }
  
  /**
   * Selecciona un libro para ver detalles
   */
  selectBook(index: number): void {
    if (this.selectedBookIndex === index) {
      this.selectedBookIndex = -1;
      return;
    }
    
    this.selectedBookIndex = index;
    const bookDetail = this.filteredBooks[index];
    
    if (!bookDetail.readingProgress) {
      this.loadBookDetails(bookDetail);
    }
  }
  
  /**
   * Carga los detalles específicos de un libro (progreso, reseñas, frases, notas)
   */
  loadBookDetails(bookDetail: BookDetail): void {
    const nickname = this.selectedUser?.nickName;
    const bookTitle = bookDetail.userBook.book_title;
    
    if (!nickname || !bookTitle) return;
    
    bookDetail.readingProgress = [];
    bookDetail.review = null;
    bookDetail.phrases = [];
    bookDetail.notes = [];
    
    const progressSub = this.readingService.getReadingProgress(nickname)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        bookDetail.readingProgress = response.data.filter(
          progress => progress.book_id === bookDetail.userBook.book_id
        );
      });
    
    const reviewSub = this.readingService.getBookReviews(bookTitle, nickname)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        if (response.data.length > 0) {
          bookDetail.review = response.data[0];
        }
      });
    
    const phrasesSub = this.readingService.getPhrases(bookTitle, nickname)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        bookDetail.phrases = response.data;
      });
    
    const notesSub = this.readingService.getNotes(bookTitle, nickname)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        bookDetail.notes = response.data;
        
        bookDetail.bookForm = this.createBookForm(bookDetail);
      });
    
    this.subscriptions.push(progressSub, reviewSub, phrasesSub, notesSub);
  }
  
  /**
   * Activa el modo de edición para un libro específico
   */
  toggleBookEditMode(bookDetail: BookDetail): void {
    bookDetail.editMode = !bookDetail.editMode;
    
    if (!bookDetail.editMode) {
      bookDetail.phrasesEditMode = false;
      bookDetail.notesEditMode = false;
      
      bookDetail.bookForm = this.createBookForm(bookDetail);
    }
  }
  
  /**
   * Activa/desactiva el modo de edición de frases
   */
  togglePhrasesEditMode(bookDetail: BookDetail): void {
    bookDetail.phrasesEditMode = !bookDetail.phrasesEditMode;
  }
  
  /**
   * Activa/desactiva el modo de edición de notas
   */
  toggleNotesEditMode(bookDetail: BookDetail): void {
    bookDetail.notesEditMode = !bookDetail.notesEditMode;
  }
  
  /**
   * Guarda los cambios de los datos del libro
   */
  saveBookChanges(bookDetail: BookDetail): void {
    if (!bookDetail.bookForm?.valid) {
      this.markFormGroupTouched(bookDetail.bookForm!);
      return;
    }
    
    bookDetail.isSaving = true;
    
    const formValue = bookDetail.bookForm!.value;
    const nickname = this.selectedUser?.nickName;
    const bookId = bookDetail.userBook.book_id;
    
    if (!nickname || !bookId) {
      bookDetail.isSaving = false;
      return;
    }
    
    const userBookUpdateData: UserBookUpdateRequest = {
      status: formValue.reading_status,
      date_start: formValue.date_start,
      date_ending: formValue.date_ending
    };
    
    const userBookSub = this.bookService.updateUserBookRelationship(nickname, bookId, userBookUpdateData)
      .pipe(
        catchError(error => {
          console.error('Error al actualizar la relación usuario-libro:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          bookDetail.userBook.reading_status = formValue.reading_status;
          bookDetail.userBook.date_start = formValue.date_start;
          bookDetail.userBook.date_ending = formValue.date_ending;
        }
      });
    
    let reviewSub: Subscription | null = null;
    if (bookDetail.review) {
      const reviewUpdateData = {
        text: formValue.review.review_text,
        rating: formValue.review.rating
      };
      
      reviewSub = this.readingService.updateReview(bookDetail.review.review_id, reviewUpdateData)
        .pipe(
          catchError(error => {
            console.error('Error al actualizar la reseña:', error);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            bookDetail.review.review_text = formValue.review.review_text;
            bookDetail.review.rating = formValue.review.rating;
          }
        });
    }
    
    const phrasePromises: Promise<any>[] = [];
    
    formValue.phrases.forEach((phraseData: any) => {
      if (phraseData.id) {
        const phrasePromise = this.readingService.updatePhrase(phraseData.id, { text: phraseData.text }).toPromise();
        phrasePromises.push(phrasePromise);
      } else if (phraseData.text.trim() !== '') {
        const newPhrase = {
          user_nickname: nickname,
          book_title: bookDetail.userBook.book_title,
          text: phraseData.text
        };
        const phrasePromise = this.readingService.addPhrase(newPhrase).toPromise();
        phrasePromises.push(phrasePromise);
      }
    });
    
    const notePromises: Promise<any>[] = [];
    
    formValue.notes.forEach((noteData: any) => {
      if (noteData.id) {
        const notePromise = this.readingService.updateNote(noteData.id, { text: noteData.text }).toPromise();
        notePromises.push(notePromise);
      } else if (noteData.text.trim() !== '') {
        const newNote = {
          user_nickname: nickname,
          book_title: bookDetail.userBook.book_title,
          text: noteData.text
        };
        const notePromise = this.readingService.addNote(newNote).toPromise();
        notePromises.push(notePromise);
      }
    });
    
    Promise.all([...phrasePromises, ...notePromises])
      .then(results => {
        bookDetail.isSaving = false;
        bookDetail.editMode = false;
        
        this.loadBookDetails(bookDetail);
        
        alert('Datos del libro actualizados correctamente');
      })
      .catch(error => {
        console.error('Error al guardar los cambios:', error);
        bookDetail.isSaving = false;
        alert('Ha ocurrido un error al guardar algunos cambios. Por favor, revisa los datos e intenta de nuevo.');
      });
    
    if (reviewSub) {
      this.subscriptions.push(reviewSub);
    }
    this.subscriptions.push(userBookSub);
  }
  
  /**
   * Calcula la edad del usuario
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
   * Obtiene el nombre completo del usuario
   */
  getUserFullName(user: AdminUser): string {
    if (!user) return '';
    return `${user.name} ${user.last_name1 || ''} ${user.last_name2 || ''}`.trim();
  }
  
  /**
   * Obtiene la URL de la imagen del usuario
   */
  getUserImageUrl(user: AdminUser | null): string {
    if (!user) {
      return '/usuarios/default.png';
    }
    
    return `/usuarios/${user.nickName}.png`;
  }
  
  /**
   * Obtiene la URL de la imagen del libro
   */
  getBookImageUrl(userBook: UserBook): string {
    if (!userBook) {
      return '/libros/default.png';
    }
    
    const bookDetail = this.userBooks.find(bd => bd.userBook.book_id === userBook.book_id);
    if (bookDetail?.book?.sagas) {
      return `/libros/${bookDetail.book.sagas}/covers/${userBook.book_title}.png`;
    } else {
      return '/libros/default.png';
    }
  }
  
  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target.src.includes('/usuarios/')) {
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
   * Obtiene estadísticas del usuario
   */
  getUserStats(): any {
    const totalBooks = this.userBooks.length;
    const readingBooks = this.userBooks.filter(b => b.userBook.reading_status === 'reading').length;
    const completedBooks = this.userBooks.filter(b => b.userBook.reading_status === 'completed').length;
    
    const authorsSet = new Set<string>();
    this.userBooks.forEach(bookDetail => {
      if (bookDetail.book?.authors) {
        const authors = bookDetail.book.authors.split(',').map(a => a.trim());
        authors.forEach(author => authorsSet.add(author.toLowerCase()));
      }
    });
    const uniqueAuthors = authorsSet.size;
    
    return {
      totalBooks,
      readingBooks,
      completedBooks,
      uniqueAuthors
    };
  }
}