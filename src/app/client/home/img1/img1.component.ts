import { Component, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../../../core/services/book/book.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-img1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './img1.component.html',
  styleUrl: './img1.component.scss',
})
export class Img1Component implements OnInit, OnDestroy {
  backgroundImageUrl: string = '/libros/Trono de cristal/fondos/fondo1.jpg'; // Default image
  animationActive: boolean = true; // Control de la animación
  private subscription: Subscription = new Subscription();

  constructor(
    private bookService: BookService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {
    console.log('Img1Component: Constructor ejecutado');
  }

  ngOnInit(): void {
    console.log('Img1Component: ngOnInit iniciado');

    // Subscribe to book updates from the service
    this.subscription = this.bookService.bookActual$.subscribe(book => {
      console.log('Libro recibido en Img1Component:', book);

      if (book) {
        // Primero, reinicia la animación desactivándola
        this.animationActive = false;
        this.cdr.detectChanges(); // Forzar actualización del DOM

        // Actualiza la URL después de un pequeño retraso
        setTimeout(() => {
          this.updateBackgroundImage(book);

          // Después de actualizar la URL, reactiva la animación
          setTimeout(() => {
            this.animationActive = true;
            this.cdr.detectChanges(); // Forzar actualización del DOM
          }, 50);
        }, 50);
      }
    });

    // Check if there's already a book in the service
    setTimeout(() => {
      const currentBook = this.bookService.getBookActual();
      if (currentBook) {
        console.log('Libro encontrado en el servicio para Img1Component:', currentBook);
        this.updateBackgroundImage(currentBook);
      }
    }, 100);
  }

  // Helper method to update the background image URL
  updateBackgroundImage(book: Book): void {
    const imagePath = book.imagen;
    const folderPathMatch = imagePath.match(/\/libros\/([^/]+)\//);

    if (folderPathMatch && folderPathMatch[1]) {
      const folderName = folderPathMatch[1];
      this.backgroundImageUrl = `/libros/${folderName}/fondos/fondo1.jpg`;
      console.log('Nueva URL de imagen de fondo:', this.backgroundImageUrl);
    } else {
      // Fallback to default if we can't extract the path
      console.warn('No se pudo extraer la ruta de la carpeta desde:', imagePath);
      this.backgroundImageUrl = '/libros/Trono de cristal/fondos/fondo1.jpg';
    }
  }

  ngOnDestroy(): void {
    console.log('Img1Component: Destruyendo componente, limpiando suscripción');
    // Clean up subscription when component is destroyed
    this.subscription.unsubscribe();
  }
}