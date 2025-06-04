import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AdminBooksService } from '../../../core/services/admin/admin-books.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { UserService } from '../../../core/services/call-api/user.service';
import { ReadingService } from '../../../core/services/call-api/reading.service';
import { Book, UserBook, BookUpdateRequest, UserBookUpdateRequest } from '../../../core/models/call-api/book.model';
import { User } from '../../../core/models/call-api/user.model';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

interface UserReading {
  user: User;
  userBook?: UserBook;
  readingProgress?: any[];
  review?: any;
  phrases?: any[];
  notes?: any[];
  editMode?: boolean;
  userForm?: FormGroup;
  progressEditMode?: boolean;
  phrasesEditMode?: boolean;
  notesEditMode?: boolean;
  isSaving?: boolean;
}

@Component({
  selector: 'app-details-book',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './details-book.component.html',
  styleUrl: './details-book.component.scss'
})
export class DetailsBookComponent implements OnInit, OnDestroy {
  selectedBook: Book | null = null;
  originalBook: Book | null = null;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  error: string = '';
  isSaving: boolean = false;
  editMode: boolean = false;
  
  bookForm: FormGroup;
  availableGenres: string[] = [];
  readingStatuses: {value: string, label: string}[] = [
    {value: 'reading', label: 'Leyendo'},
    {value: 'completed', label: 'Completado'},
    {value: 'dropped', label: 'Abandonado'},
    {value: 'on_hold', label: 'En pausa'},
    {value: 'plan_to_read', label: 'Por leer'}
  ];
  
  users: User[] = [];
  bookUsers: UserReading[] = [];
  selectedUserIndex: number = -1;
  
  Math = Math;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private adminBooksService: AdminBooksService,
    private bookService: BookService,
    private userService: UserService,
    private readingService: ReadingService,
    private fb: FormBuilder
  ) {
    this.bookForm = this.createBookForm();
  }

  ngOnInit(): void {
    this.subscribeToBookSelection();
    this.subscribeToModalState();
    this.loadAvailableGenres();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Crea el formulario para el libro
   */
  createBookForm(): FormGroup {
    return this.fb.group({
      book_title: ['', [Validators.required]],
      book_pages: [0, [Validators.required, Validators.min(1)]],
      authors: ['', [Validators.required]],
      genres: [''],
      sagas: [''],
      synopsis: ['']
    });
  }
  
  /**
   * Crea el formulario para un usuario
   */
  createUserForm(userReading: UserReading): FormGroup {
    const form = this.fb.group({
      reading_status: [userReading.userBook?.reading_status || ''],
      date_added: [userReading.userBook?.date_added || ''],
      date_start: [userReading.userBook?.date_start || ''],
      date_ending: [userReading.userBook?.date_ending || ''],
      
      review: this.fb.group({
        rating: [userReading.review?.rating || 0, [Validators.min(0), Validators.max(10)]],
        review_text: [userReading.review?.review_text || '']
      }),
      
      phrases: this.fb.array([]),
      
      notes: this.fb.array([])
    });
    
    if (userReading.phrases && userReading.phrases.length > 0) {
      const phrasesArray = form.get('phrases') as FormArray;
      userReading.phrases.forEach(phrase => {
        phrasesArray.push(this.fb.group({
          id: [phrase.id],
          text: [phrase.text, Validators.required],
          date_added: [phrase.date_added]
        }));
      });
    }
    
    if (userReading.notes && userReading.notes.length > 0) {
      const notesArray = form.get('notes') as FormArray;
      userReading.notes.forEach(note => {
        notesArray.push(this.fb.group({
          id: [note.id],
          text: [note.text, Validators.required],
          date_created: [note.date_created],
          date_modified: [note.date_modified]
        }));
      });
    }
    
    return form;
  }
  
  /**
   * Helper para obtener las frases como FormArray
   */
  getPhrases(userForm: FormGroup): FormArray {
    return userForm.get('phrases') as FormArray;
  }
  
  /**
   * Helper para obtener las notas como FormArray
   */
  getNotes(userForm: FormGroup): FormArray {
    return userForm.get('notes') as FormArray;
  }
  
  /**
   * Añade una nueva frase al formulario
   */
  addPhrase(userReading: UserReading): void {
    const phrases = this.getPhrases(userReading.userForm!);
    phrases.push(this.fb.group({
      id: [null],
      text: ['', Validators.required],
      date_added: [new Date().toISOString().split('T')[0]]
    }));
  }
  
  /**
   * Elimina una frase del formulario
   */
  removePhrase(userReading: UserReading, index: number): void {
    const phrases = this.getPhrases(userReading.userForm!);
    
    const phraseGroup = phrases.at(index) as FormGroup;
    const phraseId = phraseGroup.get('id')?.value;
    
    if (phraseId) {
      if (confirm('¿Estás seguro de eliminar esta frase? Esta acción no se puede deshacer.')) {
        this.readingService.deletePhrase(phraseId).subscribe(
          () => {
            phrases.removeAt(index);
            if (userReading.phrases) {
              userReading.phrases = userReading.phrases.filter(p => p.id !== phraseId);
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
  addNote(userReading: UserReading): void {
    const notes = this.getNotes(userReading.userForm!);
    notes.push(this.fb.group({
      id: [null],
      text: ['', Validators.required],
      date_created: [new Date().toISOString().split('T')[0]],
      date_modified: [null]
    }));
  }
  
  /**
   * Elimina una nota del formulario
   */
  removeNote(userReading: UserReading, index: number): void {
    const notes = this.getNotes(userReading.userForm!);
    
    const noteGroup = notes.at(index) as FormGroup;
    const noteId = noteGroup.get('id')?.value;
    
    if (noteId) {
      if (confirm('¿Estás seguro de eliminar esta nota? Esta acción no se puede deshacer.')) {
        this.readingService.deleteNote(noteId).subscribe(
          () => {
            notes.removeAt(index);
            if (userReading.notes) {
              userReading.notes = userReading.notes.filter(n => n.id !== noteId);
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
   * Carga los géneros disponibles
   */
  loadAvailableGenres(): void {
    this.availableGenres = [
      'Romantasy', 'Fantasía épica', 'Dragones', 'Fantasía heroica', 'Faes',
      'Fantasía oscura', 'Romance', 'Fantasía', 'Fantasía urbana', 'New adult',
      'Fantasía juvenil', 'Distopía', 'Dioses', 'Fantasía política', 
      'Sistema de mágia', 'Dark romance', 'Thriller', 'Poderes', 'Ciencia ficción',
      'Circense', 'Horror', 'Vampiros', 'BL', 'Retelling', 'Bully romance',
      'Demonios', 'Romance contemporaneo'
    ];
  }

  /**
   * Suscripción al libro seleccionado
   */
  subscribeToBookSelection(): void {
    const subscription = this.adminBooksService.getSelectedBook().subscribe(book => {
      this.selectedBook = book ? {...book} : null;
      this.originalBook = book ? {...book} : null;
      
      if (book) {
        this.updateBookForm(book);
        this.loadBookUsers(book.book_id);
      }
    });
    
    this.subscriptions.push(subscription);
  }
  
  /**
   * Actualiza el formulario con los datos del libro
   */
  updateBookForm(book: Book): void {
    this.bookForm.patchValue({
      book_title: book.book_title || '',
      book_pages: book.book_pages || 0,
      authors: book.authors || '',
      genres: book.genres || '',
      sagas: book.sagas || '',
      synopsis: book.synopsis || ''
    });
  }
  
  /**
   * Suscripción al estado del modal
   */
  subscribeToModalState(): void {
    const subscription = this.adminBooksService.getModalState().subscribe(state => {
      this.isModalOpen = state;
      if (!state) {
        this.editMode = false;
        if (this.selectedBook && this.originalBook) {
          this.selectedBook = {...this.originalBook};
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
    
    this.adminBooksService.closeModal();
    this.selectedUserIndex = -1;
    this.editMode = false;
  }
  
  /**
   * Activa el modo de edición
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;
    
    if (!this.editMode && this.selectedBook && this.originalBook) {
      this.selectedBook = {...this.originalBook};
      this.updateBookForm(this.originalBook);
    }
    
    if (!this.editMode) {
      this.bookUsers.forEach(user => {
        user.editMode = false;
        user.progressEditMode = false;
        user.phrasesEditMode = false;
        user.notesEditMode = false;
      });
    }
  }
  
  /**
   * Guarda los cambios del libro
   */
  saveChanges(): void {
    if (this.bookForm.invalid) {
      this.markFormGroupTouched(this.bookForm);
      return;
    }
    
    if (!this.selectedBook || !this.selectedBook.book_id) {
      this.error = 'No se puede guardar: ID de libro no válido';
      return;
    }
    
    this.isSaving = true;
    
    const formData = this.bookForm.value;
    const updateData: BookUpdateRequest = {
      title: formData.book_title,
      pages: formData.book_pages
    };
    
    const subscription = this.bookService.updateBook(this.selectedBook.book_id, updateData)
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
          this.originalBook = {...this.selectedBook, ...formData};
          this.selectedBook = {...this.selectedBook, ...formData};
          this.editMode = false;
          
          alert('Libro actualizado correctamente');
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
   * Carga los usuarios que tienen registrado el libro
   */
  loadBookUsers(bookId: number): void {
    this.isLoading = true;
    this.error = '';
    
    const subscription = this.userService.getAllUsers()
      .pipe(
        map(response => response.data),
        switchMap(users => {
          this.users = users;
          
          const userObservables = users.map(user => 
            this.bookService.getUserBooks(user.nickName, undefined, 1, 1000)
              .pipe(
                map(response => {
                  const userBook = response.data.find(ub => ub.book_id === bookId);
                  if (userBook) {
                    return { 
                      user, 
                      userBook,
                      editMode: false,
                      progressEditMode: false,
                      phrasesEditMode: false,
                      notesEditMode: false,
                      isSaving: false
                    } as UserReading;
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
          console.error('Error al cargar usuarios del libro:', error);
          this.error = 'No se pudieron cargar los usuarios. Por favor, intenta de nuevo más tarde.';
          return of([]);
        })
      )
      .subscribe(results => {
        this.bookUsers = results.filter(result => result !== null) as UserReading[];
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
    const userReading = this.bookUsers[index];
    
    if (!userReading.readingProgress) {
      this.loadUserReadingDetails(userReading);
    }
  }
  
  /**
   * Carga los detalles de lectura de un usuario específico
   */
  loadUserReadingDetails(userReading: UserReading): void {
    const user = userReading.user;
    const bookId = this.selectedBook?.book_id;
    
    if (!bookId) return;
    
    userReading.readingProgress = [];
    userReading.review = null;
    userReading.phrases = [];
    userReading.notes = [];
    
    const progressSub = this.readingService.getReadingProgress(user.nickName)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        userReading.readingProgress = response.data.filter(
          progress => progress.book_id === bookId
        );
      });
    
    const reviewSub = this.readingService.getBookReviews(this.selectedBook?.book_title, user.nickName)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        if (response.data.length > 0) {
          userReading.review = response.data[0];
        }
      });
    
    const phrasesSub = this.readingService.getPhrases(this.selectedBook?.book_title, user.nickName)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        userReading.phrases = response.data;
      });
    
    const notesSub = this.readingService.getNotes(this.selectedBook?.book_title, user.nickName)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(response => {
        userReading.notes = response.data;
        
        userReading.userForm = this.createUserForm(userReading);
      });
    
    this.subscriptions.push(progressSub, reviewSub, phrasesSub, notesSub);
  }
  
  /**
   * Activa el modo de edición para un usuario específico
   */
  toggleUserEditMode(userReading: UserReading): void {
    userReading.editMode = !userReading.editMode;
    
    if (!userReading.editMode) {
      userReading.progressEditMode = false;
      userReading.phrasesEditMode = false;
      userReading.notesEditMode = false;
      
      userReading.userForm = this.createUserForm(userReading);
    }
  }
  
  /**
   * Activa/desactiva el modo de edición de progreso
   */
  toggleProgressEditMode(userReading: UserReading): void {
    userReading.progressEditMode = !userReading.progressEditMode;
  }
  
  /**
   * Activa/desactiva el modo de edición de frases
   */
  togglePhrasesEditMode(userReading: UserReading): void {
    userReading.phrasesEditMode = !userReading.phrasesEditMode;
  }
  
  /**
   * Activa/desactiva el modo de edición de notas
   */
  toggleNotesEditMode(userReading: UserReading): void {
    userReading.notesEditMode = !userReading.notesEditMode;
  }
  
  /**
   * Guarda los cambios de los datos del usuario
   */
  saveUserChanges(userReading: UserReading): void {
    if (!userReading.userForm?.valid) {
      this.markFormGroupTouched(userReading.userForm!);
      return;
    }
    
    userReading.isSaving = true;
    
    const formValue = userReading.userForm!.value;
    const nickname = userReading.user.nickName;
    const bookId = this.selectedBook?.book_id;
    
    if (!bookId) {
      userReading.isSaving = false;
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
          if (userReading.userBook) {
            userReading.userBook.reading_status = formValue.reading_status;
            userReading.userBook.date_start = formValue.date_start;
            userReading.userBook.date_ending = formValue.date_ending;
          }
        }
      });
    
    let reviewSub: Subscription | null = null;
    if (userReading.review) {
      const reviewUpdateData = {
        text: formValue.review.review_text,
        rating: formValue.review.rating
      };
      
      reviewSub = this.readingService.updateReview(userReading.review.review_id, reviewUpdateData)
        .pipe(
          catchError(error => {
            console.error('Error al actualizar la reseña:', error);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            userReading.review.review_text = formValue.review.review_text;
            userReading.review.rating = formValue.review.rating;
          }
        });
    }
    
    const phrasePromises: Promise<any>[] = [];
    
    formValue.phrases.forEach((phraseData: any, index: number) => {
      if (phraseData.id) {
        const phrasePromise = this.readingService.updatePhrase(phraseData.id, { text: phraseData.text }).toPromise();
        phrasePromises.push(phrasePromise);
      } else if (phraseData.text.trim() !== '') {
        const newPhrase = {
          user_nickname: nickname,
          book_title: this.selectedBook?.book_title || '',
          text: phraseData.text
        };
        const phrasePromise = this.readingService.addPhrase(newPhrase).toPromise();
        phrasePromises.push(phrasePromise);
      }
    });
    
    const notePromises: Promise<any>[] = [];
    
    formValue.notes.forEach((noteData: any, index: number) => {
      if (noteData.id) {
        const notePromise = this.readingService.updateNote(noteData.id, { text: noteData.text }).toPromise();
        notePromises.push(notePromise);
      } else if (noteData.text.trim() !== '') {
        const newNote = {
          user_nickname: nickname,
          book_title: this.selectedBook?.book_title || '',
          text: noteData.text
        };
        const notePromise = this.readingService.addNote(newNote).toPromise();
        notePromises.push(notePromise);
      }
    });
    
    Promise.all([...phrasePromises, ...notePromises])
      .then(results => {
        userReading.isSaving = false;
        userReading.editMode = false;
        
        this.loadUserReadingDetails(userReading);
        
        alert('Datos del usuario actualizados correctamente');
      })
      .catch(error => {
        console.error('Error al guardar los cambios:', error);
        userReading.isSaving = false;
        alert('Ha ocurrido un error al guardar algunos cambios. Por favor, revisa los datos e intenta de nuevo.');
      });
    
    if (reviewSub) {
      this.subscriptions.push(reviewSub);
    }
    this.subscriptions.push(userBookSub);
  }
  
  /**
   * Formatea una fecha para mostrarla
   */
  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/images/user-default.png';
  }
  
  /**
   * Obtiene la URL de la imagen de portada
   */
  getBookImageUrl(book: Book | null): string {
    if (!book) {
      return '/libros/default.png';
    } else {
      if (book.sagas) {
        return `/libros/${book.sagas}/covers/${book.book_title}.png`;
      } else {
        return '/libros/default.png';
      }
    }
  }
  
  /**
   * Obtiene la URL de la imagen de usuario
   */
  getUserImageUrl(nickname: string): string {
    return `/usuarios/${nickname}.png`;
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
}