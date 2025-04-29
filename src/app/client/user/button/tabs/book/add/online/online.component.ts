import { Component, ViewChild, ElementRef ,Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { OnlinePdfService,GoogleBookItem } from '../../../../../../../core/services/pdf-online/pdf-online.service';

interface NgxFile extends File {
  preview: string;
}

@Component({
  selector: 'app-online',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxDropzoneModule],
  templateUrl: './online.component.html',
  styleUrl: './online.component.scss'
})
export class OnlineComponent {
  @Output() bookSelected = new EventEmitter<GoogleBookItem>();
  
  files: NgxFile[] = [];
  selectedFile: File | null = null;
  bookTitle: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  bookResults: GoogleBookItem[] = [];
  selectedBook: GoogleBookItem | null = null;
  
  constructor(private onlinePdfService: OnlinePdfService) {
    console.log('OnlineComponent inicializado');
  }
  
  /**
   * Maneja la selección de archivos de ngx-dropzone
   */
  onSelect(event: { addedFiles: File[] }): void {
    console.log('Archivos seleccionados mediante dropzone:', event.addedFiles);
    
    this.files = [];
    this.selectedFile = null;
    this.errorMessage = '';
    
    const file = event.addedFiles[0];
    
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }
    
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.files.push(file as NgxFile);
      this.selectedFile = file;
      console.log('Archivo PDF seleccionado:', file.name);
    } else {
      this.errorMessage = 'Solo se aceptan archivos PDF';
      console.error('El archivo no es un PDF:', file.type);
    }
  }
  

  
  /**
   * Maneja la eliminación de archivos de ngx-dropzone
   */
  onRemove(file: NgxFile): void {
    console.log('Eliminando archivo:', file.name);
    this.files = this.files.filter(f => f !== file);
    this.selectedFile = null;
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    console.log('Botón de búsqueda clickeado');
    
    if (!this.selectedFile) {
      this.errorMessage = 'Por favor, selecciona un archivo PDF';
      console.error('Error: No hay archivo seleccionado');
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.bookResults = [];
    this.selectedBook = null;
    
    console.log('Iniciando búsqueda con:', {
      archivo: this.selectedFile.name,
      título: this.bookTitle || '(no especificado)'
    });
    
    this.onlinePdfService.uploadPdf(this.selectedFile, this.bookTitle)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Respuesta recibida:', response);
          
          if (response.message && response.message.items && response.message.items.length > 0) {
            this.bookResults = response.message.items;
            console.log('Libros encontrados:', this.bookResults.length);
          } else {
            this.errorMessage = 'No se encontraron libros en el documento';
            console.log('No se encontraron libros');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error al procesar el PDF';
          console.error('Error durante la búsqueda:', error);
        }
      });
  }
  
  /**
   * Muestra detalles de un libro
   */
  viewBookDetails(book: GoogleBookItem): void {
    this.selectedBook = book;
    console.log('Ver detalles del libro:', book.volumeInfo?.title);
  }
  
  /**
   * Vuelve a la lista de resultados
   */
  backToResults(): void {
    this.selectedBook = null;
  }
  
  /**
   * Selecciona un libro y lo emite al componente padre
   */
  selectBook(book: GoogleBookItem): void {
    console.log('Libro seleccionado:', book.volumeInfo?.title);
    this.bookSelected.emit(book);
  }
  
  /**
   * Obtiene el ISBN de un libro
   */
  getISBN(book: GoogleBookItem): string {
    const identifiers = book.volumeInfo?.industryIdentifiers;
    if (!identifiers) return 'No disponible';
    
    const isbn13 = identifiers.find(id => id?.type === 'ISBN_13');
    const isbn10 = identifiers.find(id => id?.type === 'ISBN_10');
    
    return isbn13?.identifier || isbn10?.identifier || 'No disponible';
  }
}