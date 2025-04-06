import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import Vibrant from 'node-vibrant'; // Importación correcta

import { BookService } from '../../../core/services/book/book.service';
import { ColorPrimaryService } from '../../../core/services/ColorPrimary/color-primary.service';
import { NgClass } from '@angular/common';
import { Book } from '../../../core/models/book-model';
@Component({
  selector: 'app-img1',
  standalone: true,
  imports: [NgClass],
  templateUrl: './img1.component.html',
  styleUrls: ['./img1.component.scss'],
})
export class Img1Component implements OnInit, OnDestroy {
  backgroundImageUrl: string = '/libros/Trono de cristal/fondos/fondo1.jpg'; // Default image
  animationActive: boolean = true; // Control de la animación
  private subscription: Subscription = new Subscription();

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef,
    private colorService: ColorPrimaryService // Servicio para enviar el color
  ) { }

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
      this.backgroundImageUrl = `/libros/${folderName}/fondos/fondo1.jpg`;
      this.extractPrimaryColor(); // Extraemos el color primario
    } else {
      // Fallback to default if we can't extract the path
      this.backgroundImageUrl = '/libros/Trono de cristal/fondos/fondo1.jpg';
    }
  }

  // Método para extraer el color primario
  extractPrimaryColor(): void {
    Vibrant.from(this.backgroundImageUrl)
      .getPalette()
      .then(palette => {
        const primary = palette.Vibrant || palette.Muted;
        const primaryColor = primary ? primary.getHex() : '#000000'; // Establece el color primario
        this.colorService.updatePrimaryColor(primaryColor); // Enviamos el color al servicio
      })
      .catch(error => {
        console.error('Error al extraer el color primario:', error);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


}
