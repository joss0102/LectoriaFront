import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-form.component.html',
  styleUrl: './add-form.component.scss'
})
export class AddFormComponent {
  // Variables para controlar la visibilidad de los modales
  showInitialOptions = true;
  showSearchOnline = false;
  showAddManually = false;
  showAddAuthor = false;
  showAddSaga = false;
  showAddSagaImages = false;
  showAddStatus = false;
  showAddPhrasesNotes = false;
  showAddGenres = false;

  // Formularios reactivos
  bookForm: FormGroup;
  authorForm: FormGroup;
  sagaForm: FormGroup;
  imagesForm: FormGroup;
  statusForm: FormGroup;
  phrasesNotesForm: FormGroup;
  genresForm: FormGroup;

  // Datos del formulario
  selectedGenres: string[] = [];
  phrases: string[] = [];
  notes: string[] = [];

  constructor(private fb: FormBuilder) {
    // Inicializar formularios
    this.bookForm = this.fb.group({
      title: ['', [Validators.required]],
      pages: ['', [Validators.min(1)]],
      author: [''],
      saga: [''],
      status: [''],
      synopsis: [''],
      genres: ['']
    });

    this.authorForm = this.fb.group({
      name: ['', [Validators.required]],
      lastName1: [''],
      lastName2: [''],
      description: ['']
    });

    this.sagaForm = this.fb.group({
      name: ['', [Validators.required]]

    });
    this.imagesForm = this.fb.group({

    });

    this.statusForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      rating: ['', [Validators.min(0), Validators.max(10)]],
      review: ['']

    });

    this.phrasesNotesForm = this.fb.group({
      phrase: [''],
      note: ['']
    });

    this.genresForm = this.fb.group({
      genre: ['']
    });
  }

  // Mostrar modales
  showSearchOnlineModal() {
    this.resetAllModals();
    this.showInitialOptions = false;
    this.showSearchOnline = true;
  }

  showAddManuallyModal() {
    this.resetAllModals();
    this.showInitialOptions = false;
    this.showAddManually = true;
  }

  showAddAuthorModal() {
    this.showAddAuthor = true;
    this.showAddManually = false;
  }

  showAddSagaModal() {
    this.showAddSaga = true;
    this.showAddManually = false;
  }

  showAddStatusModal() {
    this.showAddStatus = true;
    this.showAddManually = false;
  }

  showAddPhrasesNotesModal() {
    this.showAddPhrasesNotes = true;
    this.showAddStatus = false;
  }

  showAddGenresModal() {
    this.showAddGenres = true;
    this.showAddManually = false;
  }

  showSagaImagesModal() {
    this.showAddSagaImages = true;
    this.showAddSaga = false;
  }

  // Cerrar modales y volver
  backToInitialOptions() {
    this.resetAllModals();
    this.showInitialOptions = true;
  }

  backToAddManually() {
    this.showAddManually = true;
    this.showAddAuthor = false;
    this.showAddSaga = false;
    this.showAddStatus = false;
    this.showAddGenres = false;
  }

  backToAddSaga() {
    this.showAddSaga = true;
    this.showAddSagaImages = false;
  }

  backToAddStatus() {
    this.showAddStatus = true;
    this.showAddPhrasesNotes = false;
  }

  // Resetear todos los modales
  resetAllModals() {
    this.showInitialOptions = false;
    this.showSearchOnline = false;
    this.showAddManually = false;
    this.showAddAuthor = false;
    this.showAddSaga = false;
    this.showAddSagaImages = false;
    this.showAddStatus = false;
    this.showAddPhrasesNotes = false;
    this.showAddGenres = false;
  }

  // Métodos para agregar elementos
  addGenre() {
    const genre = this.genresForm.get('genre')?.value;
    if (genre && !this.selectedGenres.includes(genre)) {
      this.selectedGenres.push(genre);
      this.genresForm.get('genre')?.reset();
    }
  }

  removeGenre(index: number) {
    this.selectedGenres.splice(index, 1);
  }

  addPhrase() {
    const phrase = this.phrasesNotesForm.get('phrase')?.value;
    if (phrase) {
      this.phrases.push(phrase);
      this.phrasesNotesForm.get('phrase')?.reset();
    }
  }

  removePhrase(index: number) {
    this.phrases.splice(index, 1);
  }

  addNote() {
    const note = this.phrasesNotesForm.get('note')?.value;
    if (note) {
      this.notes.push(note);
      this.phrasesNotesForm.get('note')?.reset();
    }
  }

  removeNote(index: number) {
    this.notes.splice(index, 1);
  }

  // Guardar datos de formularios
  saveAuthor() {
    console.log('Autor guardado:', this.authorForm.value);
    this.backToAddManually();
  }

  saveSaga() {
    console.log('Saga guardada:', this.sagaForm.value);
    this.backToAddManually();
  }

  saveSagaImages() {
    console.log('Imágenes de saga guardadas',this.imagesForm.value);
    this.backToAddSaga();
  }

  saveStatus() {
    console.log('Estado guardado:', this.statusForm.value);
    this.backToAddManually();
  }

  savePhrasesNotes() {
    console.log('Frases guardadas:', this.phrases);
    console.log('Notas guardadas:', this.notes);
    this.backToAddStatus();
  }

  saveGenres() {
    console.log('Géneros guardados:', this.selectedGenres);
    this.backToAddManually();
  }

  // Enviar formulario principal
  submitBook() {
    if (this.bookForm.valid) {
      console.log('Libro guardado:', {
        ...this.bookForm.value,
        genres: this.selectedGenres,
        phrases: this.phrases,
        notes: this.notes
      });
      this.resetAllData();
      this.backToInitialOptions();
    } else {
      Object.keys(this.bookForm.controls).forEach(key => {
        this.bookForm.get(key)?.markAsTouched();
      });
    }
  }

  // Resetear todos los datos
  resetAllData() {
    this.bookForm.reset();
    this.authorForm.reset();
    this.sagaForm.reset();
    this.statusForm.reset();
    this.phrasesNotesForm.reset();
    this.genresForm.reset();
    this.selectedGenres = [];
    this.phrases = [];
    this.notes = [];
  }
}