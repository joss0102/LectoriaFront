import { Component, OnInit, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService, Book } from '../../../core/services/book/book.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-img2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './img2.component.html',
  styleUrl: './img2.component.scss',
})
export class Img2Component implements OnInit, OnDestroy {
  backgroundImageUrl: string = '/libros/Trono de cristal/fondos/fondo2.jpg'; // Default image
  animationActive: boolean = true; // Control de la animación
  private subscription: Subscription = new Subscription();

  constructor(
    private bookService: BookService,
    private el: ElementRef,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {


    // Subscribe to book updates from the service
    this.subscription = this.bookService.bookActual$.subscribe(book => {


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
      this.backgroundImageUrl = `/libros/${folderName}/fondos/fondo2.jpg`;

    } else {
      // Fallback to default if we can't extract the path
      console.warn('No se pudo extraer la ruta de la carpeta desde:', imagePath);
      this.backgroundImageUrl = '/libros/Trono de cristal/fondos/fondo2.jpg';
    }
  }

  ngOnDestroy(): void {

    // Clean up subscription when component is destroyed
    this.subscription.unsubscribe();
  }
}