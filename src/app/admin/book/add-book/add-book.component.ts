import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AddBookService } from '../../../core/services/add-book/add-book.service';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { AddBookModel } from '../../../core/models/add-book.model';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.scss']
})
export class AddBookComponent implements OnInit {
  @Output() bookAdded = new EventEmitter<boolean>();
  bookForm!: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  
  genres: string[] = [];
  authors: any[] = [];
  sagas: any[] = [];
  isLoadingGenres = false;
  isLoadingAuthors = false;
  isLoadingSagas = false;
  isSubmitting = false;
  
  showCustomGenre: boolean[] = [false, false, false, false, false];
  showCustomSaga = false;
  showNewAuthorForm = false;

  constructor(
    private fb: FormBuilder,
    private addBookService: AddBookService,
    private authorService: AuthorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.setupAuthorSearch();
  }

  /**
   * Inicializa el formulario con sus validaciones
   */
  initForm(): void {
    this.bookForm = this.fb.group({
      basicInfo: this.fb.group({
        title: ['', [Validators.required]],
        pages: ['', [Validators.required, Validators.min(1)]],
        synopsis: [''],
        saga_id: [''],
        custom_saga: [''],
        saga_name: ['']
      }),
      
      authorInfo: this.fb.group({
        author_id: [''],
        authorSearch: [''],
        author_name: ['', [Validators.required]],
        author_last_name1: [''],
        author_last_name2: ['']
      }),
      
      genreInfo: this.fb.group({
        genre1: [''],
        custom_genre1: [''],
        genre2: [''],
        custom_genre2: [''],
        genre3: [''],
        custom_genre3: [''],
        genre4: [''],
        custom_genre4: [''],
        genre5: [''],
        custom_genre5: ['']
      })
    });

    this.bookForm.get('basicInfo.saga_id')?.valueChanges.subscribe(sagaId => {
      const sagaNameControl = this.bookForm.get('basicInfo.saga_name');
      if (sagaId === 'custom') {
        this.showCustomSaga = true;
        sagaNameControl?.setValue('');
      } else if (sagaId) {
        this.showCustomSaga = false;
        const selectedSaga = this.sagas.find(s => s.id == sagaId);
        if (selectedSaga) {
          sagaNameControl?.setValue(selectedSaga.name);
        }
      } else {
        this.showCustomSaga = false;
        sagaNameControl?.setValue('');
      }
    });

    this.bookForm.get('authorInfo.author_id')?.valueChanges.subscribe(authorId => {
      this.showNewAuthorForm = authorId === 'new';
      
      if (authorId && authorId !== 'new') {
        const selectedAuthor = this.authors.find(a => a.id == authorId);
        if (selectedAuthor) {
          this.bookForm.get('authorInfo.author_name')?.setValue(selectedAuthor.name);
          this.bookForm.get('authorInfo.author_last_name1')?.setValue(selectedAuthor.last_name1 || '');
          this.bookForm.get('authorInfo.author_last_name2')?.setValue(selectedAuthor.last_name2 || '');
        }
      } else if (authorId === 'new') {
        this.bookForm.get('authorInfo.author_name')?.setValue('');
        this.bookForm.get('authorInfo.author_last_name1')?.setValue('');
        this.bookForm.get('authorInfo.author_last_name2')?.setValue('');
      }
    });
  }

  /**
   * Carga los datos iniciales (géneros, autores, sagas)
   */
  loadInitialData(): void {
    this.isLoadingSagas = true;
    this.addBookService.getAllSagas().subscribe({
      next: (data) => {
        this.sagas = data;
        this.isLoadingSagas = false;
      },
      error: (error) => {
        console.error('Error al cargar sagas:', error);
        this.isLoadingSagas = false;
        this.sagas = [];
      }
    });

    this.isLoadingAuthors = true;
    this.addBookService.getAllAuthors().subscribe({
      next: (response) => {
        this.authors = response.data;
        this.isLoadingAuthors = false;
      },
      error: (error) => {
        console.error('Error al cargar autores:', error);
        this.isLoadingAuthors = false;
        this.authors = [];
      }
    });

    this.isLoadingGenres = true;
    this.addBookService.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.isLoadingGenres = false;
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
        this.isLoadingGenres = false;
        this.genres = [];
      }
    });
  }

  /**
   * Configura la búsqueda de autores
   */
  setupAuthorSearch(): void {
    this.bookForm.get('authorInfo.authorSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingAuthors = true),
        switchMap(term => {
          if (!term || term.length < 2) {
            return this.addBookService.getAllAuthors();
          }
          return this.addBookService.searchAuthors(term).pipe(
            catchError(() => {
              console.error('Error al buscar autores');
              return of({ data: [], pagination: { total_items: 0 } });
            })
          );
        }),
        tap(() => this.isLoadingAuthors = false)
      )
      .subscribe(response => {
        this.authors = response.data;
      });
  }

  /**
   * Cambia entre género predefinido y personalizado
   */
  toggleCustomGenre(index: number): void {
    this.showCustomGenre[index] = !this.showCustomGenre[index];
    
    const genreNumber = index + 1;
    const genreControl = this.bookForm.get(`genreInfo.genre${genreNumber}`);
    const customGenreControl = this.bookForm.get(`genreInfo.custom_genre${genreNumber}`);
    
    if (this.showCustomGenre[index]) {
      genreControl?.setValue('');
    } else {
      customGenreControl?.setValue('');
    }
  }

  /**
   * Avanza al siguiente paso del formulario
   */
  nextStep(): void {
    const currentFormGroup = this.getCurrentFormGroup();
    
    if (currentFormGroup.valid) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markFormGroupTouched(currentFormGroup);
      alert('Por favor, completa todos los campos requeridos.');
    }
  }

  /**
   * Retrocede al paso anterior del formulario
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Obtiene el grupo de formulario actual según el paso
   */
  getCurrentFormGroup(): FormGroup {
    switch (this.currentStep) {
      case 1:
        return this.bookForm.get('basicInfo') as FormGroup;
      case 2:
        return this.bookForm.get('authorInfo') as FormGroup;
      case 3:
        return this.bookForm.get('genreInfo') as FormGroup;
      default:
        return this.bookForm.get('basicInfo') as FormGroup;
    }
  }

  /**
   * Marca todos los campos de un grupo como tocados para mostrar validaciones
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Prepara los datos del libro para enviar al servicio
   */
  prepareBookData(): AddBookModel {
    const formValue = this.bookForm.value;
    const basicInfo = formValue.basicInfo;
    const authorInfo = formValue.authorInfo;
    const genreInfo = formValue.genreInfo;

    let saga_name = '';
    if (basicInfo.saga_id && basicInfo.saga_id !== 'custom') {
      saga_name = basicInfo.saga_name || '';
    } else if (basicInfo.saga_id === 'custom' && basicInfo.custom_saga) {
      saga_name = basicInfo.custom_saga;
    }

    const genres = [];
    for (let i = 1; i <= 5; i++) {
      if (this.showCustomGenre[i - 1] && genreInfo[`custom_genre${i}`]) {
        genres.push(genreInfo[`custom_genre${i}`]);
      } else if (genreInfo[`genre${i}`]) {
        genres.push(genreInfo[`genre${i}`]);
      }
    }

    return {
      title: basicInfo.title,
      pages: basicInfo.pages,
      synopsis: basicInfo.synopsis || '',
      author_name: authorInfo.author_name,
      author_last_name1: authorInfo.author_last_name1 || '',
      author_last_name2: authorInfo.author_last_name2 || '',
      genre1: genres[0] || '',
      genre2: genres[1] || '',
      genre3: genres[2] || '',
      genre4: genres[3] || '',
      genre5: genres[4] || '',
      saga_name,
      user_nickname: '',
      status: undefined,
      date_added: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Envía el formulario al servidor
   */
  onSubmit(): void {
    if (this.bookForm.valid) {
      this.isSubmitting = true;
      
      const bookData = this.prepareBookData();
      
      this.addBookService.addBook(bookData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          alert('Libro añadido correctamente');
          this.bookAdded.emit(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          alert('Error al añadir el libro: ' + (error.error?.error || error.message || 'Error de servidor'));
        }
      });
    } else {
      this.markFormGroupTouched(this.bookForm);
      alert('Por favor, completa todos los campos requeridos.');
    }
  }
}