import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddBookService } from '../../../../../../../core/services/add-book/add-book.service';
import { AddBookModel } from '../../../../../../../core/models/add-book.model';
import { Router } from '@angular/router';
import { OnlineComponent } from '../online/online.component';
import { AuthService } from '../../../../../../../core/services/auth/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GoogleBookItem } from '../../../../../../../core/services/pdf-online/pdf-online.service';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OnlineComponent],
  templateUrl: './add-form.component.html',
  styleUrls: ['./add-form.component.scss']
})
export class AddFormComponent implements OnInit {
  // Control what part of the UI is visible
  showInitialOptions = true;
  showSearchOnline = false;
  showAddManually = false;
  isLoading = false;
  
  // Form related properties
  bookForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  
  // Reading status options
  readingStatuses = [
    { value: 'plan_to_read', label: 'Planear leer' },
    { value: 'reading', label: 'Leyendo' },
    { value: 'completed', label: 'Completado' },
    { value: 'on_hold', label: 'En pausa' },
    { value: 'dropped', label: 'Abandonado' }
  ];

  // Data properties
  genres: string[] = [];
  loadingGenres = false;
  
  // Custom genre options
  showCustomGenre: boolean[] = [false, false, false, false, false];
  customGenrePlaceholders: string[] = [];

  // Authors and sagas data
  authors: any[] = [];
  sagas: any[] = [];
  isLoadingAuthors = false;
  isLoadingSagas = false;
  showCustomSaga = false;
  showSelectAuthor = true;

  // Servicio simple de notificación
  notificationService = {
    success: (message: string) => {
      console.log('Éxito:', message);
      alert('✅ ' + message);
    },
    error: (message: string) => {
      console.error('Error:', message);
      alert('❌ ' + message);
    }
  };

  constructor(
    private fb: FormBuilder,
    private addBookService: AddBookService,
    private router: Router,
    private authService: AuthService
  ) { 
    this.customGenrePlaceholders = Array(5).fill('').map((_, i) => `Escribe un género personalizado ${i+1}`);
  }

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    
    // Verificar que el usuario esté autenticado
    if (!this.authService.isLoggedIn()) {
      this.notificationService.error('Debes iniciar sesión para añadir un libro');
      this.router.navigate(['/login']);
    }

    // Configurar observadores para búsqueda de autores
    this.setupAuthorSearch();
  }

  loadInitialData(): void {
    // Cargar sagas
    this.isLoadingSagas = true;
    this.addBookService.getAllSagas().subscribe({
      next: (data) => {
        this.sagas = data;
        this.isLoadingSagas = false;
        console.log('Sagas cargadas:', this.sagas);
      },
      error: (error) => {
        console.error('Error al cargar sagas:', error);
        this.isLoadingSagas = false;
        // Si falla, inicializamos un array vacío
        this.sagas = [];
      }
    });

    // Cargar lista inicial de autores
    this.isLoadingAuthors = true;
    this.addBookService.getAllAuthors().subscribe({
      next: (response) => {
        this.authors = response.data;
        this.isLoadingAuthors = false;
        console.log('Autores cargados:', this.authors);
      },
      error: (error) => {
        console.error('Error al cargar autores:', error);
        this.isLoadingAuthors = false;
        // Si falla, inicializamos un array vacío
        this.authors = [];
      }
    });

    // Cargar géneros desde los libros
    this.loadingGenres = true;
    this.addBookService.getAllGenres().subscribe({
      next: (data) => {
        this.genres = data;
        this.loadingGenres = false;
        console.log('Géneros cargados:', this.genres);
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
        this.loadingGenres = false;
        // Si falla, usamos una lista predefinida de géneros
        this.genres = [
          'Romantasy', 'Fantasía épica', 'Dragones', 'Fantasía heroica', 'Faes',
          'Fantasía oscura', 'Romance', 'Fantasía', 'Fantasía urbana', 'New adult',
          'Fantasía juvenil', 'Distopía', 'Dioses', 'Fantasía política', 'Sistema de magia',
          'Dark romance', 'Thriller', 'Poderes', 'Ciencia ficción', 'Circense',
          'Horror', 'Vampiros', 'BL', 'Retelling', 'Bully romance', 'Demonios', 
          'Romance contemporaneo'
        ];
      }
    });
  }

  setupAuthorSearch(): void {
    // Configurar la búsqueda de autores al escribir
    this.bookForm.get('authorInfo.authorSearch')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.isLoadingAuthors = true),
        switchMap(term => {
          if (!term || term.length < 2) {
            // Si el término está vacío o es muy corto, cargar la lista inicial
            return this.addBookService.getAllAuthors();
          }
          return this.addBookService.searchAuthors(term).pipe(
            catchError(() => {
              this.notificationService.error('Error al buscar autores');
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
      }),
      
      userInfo: this.fb.group({
        status: ['plan_to_read'],
        date_added: [new Date().toISOString().split('T')[0]],
        date_start: [''],
        date_ending: [''],
        custom_description: [''],
        rating: [null, [Validators.min(1), Validators.max(10)]],
        review: [''],
        phrases: [''],
        notes: ['']
      })
    });

    this.bookForm.get('userInfo.status')?.valueChanges.subscribe(status => {
      if (status === 'completed') {
        this.bookForm.get('userInfo.date_ending')?.setValidators([Validators.required]);
      } else {
        this.bookForm.get('userInfo.date_ending')?.clearValidators();
      }
      this.bookForm.get('userInfo.date_ending')?.updateValueAndValidity();
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
      if (authorId && authorId !== 'new') {
        const selectedAuthor = this.authors.find(a => a.id == authorId);
        if (selectedAuthor) {
          this.bookForm.get('authorInfo.author_name')?.setValue(selectedAuthor.name);
          this.bookForm.get('authorInfo.author_last_name1')?.setValue(selectedAuthor.last_name1 || '');
          this.bookForm.get('authorInfo.author_last_name2')?.setValue(selectedAuthor.last_name2 || '');
        }
        this.showSelectAuthor = true;
      } else if (authorId === 'new') {
        this.bookForm.get('authorInfo.author_name')?.setValue('');
        this.bookForm.get('authorInfo.author_last_name1')?.setValue('');
        this.bookForm.get('authorInfo.author_last_name2')?.setValue('');
        this.showSelectAuthor = false;
      }
    });
  }

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

  showSearchOnlineModal(): void {
    this.showInitialOptions = false;
    this.showSearchOnline = true;
    this.showAddManually = false;
  }

  showAddManuallyModal(): void {
    this.showInitialOptions = false;
    this.showSearchOnline = false;
    this.showAddManually = true;
  }

  backToInitialOptions(): void {
    this.showInitialOptions = true;
    this.showSearchOnline = false;
    this.showAddManually = false;
  }

  nextStep(): void {
    const currentFormGroup = this.getCurrentFormGroup();
    
    if (currentFormGroup.valid) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    } else {
      this.markFormGroupTouched(currentFormGroup);
      this.notificationService.error('Por favor, completa todos los campos requeridos.');
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  getCurrentFormGroup(): FormGroup {
    switch (this.currentStep) {
      case 1:
        return this.bookForm.get('basicInfo') as FormGroup;
      case 2:
        return this.bookForm.get('authorInfo') as FormGroup;
      case 3:
        return this.bookForm.get('genreInfo') as FormGroup;
      case 4:
        return this.bookForm.get('userInfo') as FormGroup;
      default:
        return this.bookForm.get('basicInfo') as FormGroup;
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  prepareBookData(): AddBookModel {
    const formValue = this.bookForm.value;
    const basicInfo = formValue.basicInfo;
    const authorInfo = formValue.authorInfo;
    const genreInfo = formValue.genreInfo;
    const userInfo = formValue.userInfo;

    let saga_name = '';
    if (basicInfo.saga_id && basicInfo.saga_id !== 'custom') {
      saga_name = basicInfo.saga_id;
    } else if (basicInfo.saga_id === 'custom' && basicInfo.custom_saga) {
      saga_name = basicInfo.custom_saga;
    }

    let author_name = authorInfo.author_name;
    let author_last_name1 = authorInfo.author_last_name1;
    let author_last_name2 = authorInfo.author_last_name2;

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
      custom_description: userInfo.custom_description || '',
      author_name,
      author_last_name1,
      author_last_name2,
      genre1: genres[0] || '',
      genre2: genres[1] || '',
      genre3: genres[2] || '',
      genre4: genres[3] || '',
      genre5: genres[4] || '',
      saga_name,
      user_nickname: this.getUserNickname(),
      status: userInfo.status,
      date_added: userInfo.date_added,
      date_start: userInfo.date_start,
      date_ending: userInfo.date_ending,
      review: userInfo.review || '',
      rating: userInfo.rating,
      phrases: userInfo.phrases || '',
      notes: userInfo.notes || ''
    };
  }
  onSubmit(): void {
    if (this.bookForm.valid) {
      this.isLoading = true;
      
      if (!this.authService.isLoggedIn()) {
        this.isLoading = false;
        this.notificationService.error('Debes iniciar sesión para añadir un libro');
        this.router.navigate(['/login']);
        return;
      }
      
      const bookData = this.prepareBookData();

      this.addBookService.addBook(bookData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notificationService.success('Libro añadido correctamente');
          this.router.navigate(['/user']);
        },
        error: (error) => {
          this.isLoading = false;
          
          if (error.status === 500 && error.error?.error === 'Error al añadir el libro') {
            this.notificationService.success('Libro añadido, pero hubo un error de comunicación');
            this.router.navigate(['/user']);
          } else {
            this.notificationService.error(error.error?.error || 'Error al añadir el libro');
            console.error('Error al añadir libro:', error);
          }
        }
      });
    } else {
      this.markFormGroupTouched(this.bookForm);
      this.notificationService.error('Por favor, completa todos los campos requeridos.');
    }
  }

  private getUserNickname(): string {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.nickname) {
      return currentUser.nickname;
    } else {
      this.notificationService.error('Debes iniciar sesión para añadir un libro');
      this.router.navigate(['/login']);
      return '';
    }
  }

  onBookSelectedFromOnline(book: GoogleBookItem): void {
    console.log('Libro seleccionado desde el componente online:', book);
    
    this.showSearchOnline = false;
    this.showAddManually = true;
    
    const basicInfo = this.bookForm.get('basicInfo');
    if (basicInfo && book.volumeInfo) {
      basicInfo.patchValue({
        title: book.volumeInfo.title || '',
        pages: book.volumeInfo.pageCount || 0,
        synopsis: book.volumeInfo.description || '',
      });
      
      if (book.volumeInfo.series) {
        const existingSaga = this.sagas.find(saga => 
          saga.name.toLowerCase().includes(book.volumeInfo.series?.toLowerCase() || '') ||
          (book.volumeInfo.series?.toLowerCase() || '').includes(saga.name.toLowerCase())
        );
        
        if (existingSaga) {
          basicInfo.get('saga_id')?.setValue(existingSaga.id);
        } else if (book.volumeInfo.series) {
          basicInfo.get('saga_id')?.setValue('custom');
          basicInfo.get('custom_saga')?.setValue(book.volumeInfo.series);
        }
      }
    }
    
    if (book.volumeInfo?.authors && book.volumeInfo.authors.length > 0) {
      const authorInfo = this.bookForm.get('authorInfo');
      const authorFullName = book.volumeInfo.authors[0];
      
      const authorParts = authorFullName.split(' ');
      let foundAuthor = null;
      
      if (authorParts.length > 0) {
        foundAuthor = this.authors.find(author => {
          const fullAuthorName = `${author.name} ${author.last_name1 || ''} ${author.last_name2 || ''}`.trim().toLowerCase();
          return fullAuthorName.includes(authorFullName.toLowerCase()) || 
                  authorFullName.toLowerCase().includes(fullAuthorName);
        });
        
        if (foundAuthor) {
          authorInfo?.get('author_id')?.setValue(foundAuthor.id);
        } else {
          authorInfo?.get('author_id')?.setValue('new');
          
          if (authorParts.length === 1) {
            authorInfo?.patchValue({
              author_name: authorParts[0],
              author_last_name1: '',
              author_last_name2: ''
            });
          } else if (authorParts.length === 2) {
            authorInfo?.patchValue({
              author_name: authorParts[0],
              author_last_name1: authorParts[1],
              author_last_name2: ''
            });
          } else if (authorParts.length >= 3) {
            authorInfo?.patchValue({
              author_name: authorParts[0],
              author_last_name1: authorParts[1],
              author_last_name2: authorParts.slice(2).join(' ')
            });
          }
        }
      }
    }
    
    if (book.volumeInfo?.categories && book.volumeInfo.categories.length > 0) {
      const genreInfo = this.bookForm.get('genreInfo');
      
      book.volumeInfo.categories.slice(0, 5).forEach((category, index) => {
        const matchingGenre = this.findSimilarGenre(category);
        
        if (matchingGenre) {
          this.showCustomGenre[index] = false;
          genreInfo?.get(`genre${index+1}`)?.setValue(matchingGenre);
        } else {
          this.showCustomGenre[index] = true;
          genreInfo?.get(`custom_genre${index+1}`)?.setValue(category);
        }
      });
    }
    
    this.currentStep = 1;
  }
  
  private findSimilarGenre(categoryName: string): string | null {
    const normalizedCategory = this.normalizeText(categoryName);
    
    const exactMatch = this.genres.find(genre => 
      this.normalizeText(genre) === normalizedCategory
    );
    if (exactMatch) return exactMatch;
    const partialMatch = this.genres.find(genre => {
      const normalizedGenre = this.normalizeText(genre);
      return normalizedGenre.includes(normalizedCategory) || 
              normalizedCategory.includes(normalizedGenre);
    });
    
    return partialMatch || null;
  }
  
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}