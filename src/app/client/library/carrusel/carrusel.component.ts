import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Books } from '../../../core/models/books-model';
import { BooksService } from '../../../core/services/book/books.service';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
})
export class CarruselComponent implements OnInit {
  finishedBooks: Books[] = [];
  currentIndex = 0;
  itemsToShow = 3;
  
  // Control de animación
  isTransitioning = false;
  
  // Parámetros de visualización
  bookWidth = 400; // Ancho base de cada libro
  bookGap = 20;    // Espacio entre libros
  visibleOffset = 0; // Offset para posicionar libros visibles
  
  // Soporte táctil
  touchStartX = 0;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener libros finalizados
    this.finishedBooks = this.booksService.getBooksByStatus('finalizado');
    
    // Calcular libros a mostrar basado en tamaño de pantalla
    this.calculateItemsToShow();
    
    // Inicialmente, mostrar el primer libro
    this.updateSelectedBook();
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateItemsToShow();
    
    // Al cambiar el tamaño de la ventana, puede ser necesario ajustar el índice
    if (this.currentIndex >= this.finishedBooks.length) {
      this.currentIndex = this.finishedBooks.length - 1;
    }
  }

  calculateItemsToShow() {
    const width = window.innerWidth;
    if (width < 600) {
      this.itemsToShow = 1;
      this.bookWidth = width * 0.8;
    } else if (width < 1000) {
      this.itemsToShow = 2;
      this.bookWidth = width * 0.4;
    } else {
      this.itemsToShow = 3;
      this.bookWidth = 350;
    }
    
    // Ajustar el espacio entre libros
    this.bookGap = Math.max(20, width * 0.02);
    
    // Recalcular las posiciones después de cambiar los parámetros
    setTimeout(() => {
      // Forzar actualización de la vista
    }, 0);
  }

  /**
   * Calcula la transformación para cada libro basado en su posición
   */
  getBookTransform(index: number): string {
    // Calcular la posición relativa considerando el bucle infinito
    let relativeIndex = index - this.currentIndex;
    
    // Ajustar para bucle infinito
    if (relativeIndex < -Math.floor(this.itemsToShow/2)) {
      relativeIndex += this.finishedBooks.length;
    } else if (relativeIndex > this.finishedBooks.length - Math.ceil(this.itemsToShow/2)) {
      relativeIndex -= this.finishedBooks.length;
    }
    
    // Posición calculada para el libro
    let position = relativeIndex * (this.bookWidth + this.bookGap);
    
    // Calcular el centro de la vista del carrusel
    const carouselContent = document.querySelector('.carrusel-content');
    const carouselCenter = carouselContent?.clientWidth ?? window.innerWidth;
    
    // Para 1 libro (móvil), centrar el libro activo
    if (this.itemsToShow === 1) {
      position += (carouselCenter / 2) - (this.bookWidth / 2);
    } 
    // Para 2 libros (tablets), ajustar el centrado para mostrar 2 libros
    else if (this.itemsToShow === 2) {
      if (relativeIndex === 0) {
        // El libro activo se posiciona ligeramente a la izquierda del centro
        position += (carouselCenter / 2) - (this.bookWidth / 2) - (this.bookGap / 2);
      } else if (relativeIndex === 1) {
        // El siguiente libro se posiciona ligeramente a la derecha del centro
        position += (carouselCenter / 2) - (this.bookWidth / 2) - (this.bookGap / 2);
      } else {
        // Los demás libros mantienen su posición relativa
        position += (carouselCenter / 2) - (this.bookWidth / 2);
      }
    } 
    // Para 3 libros (escritorio), centrar el libro activo
    else {
      position += (carouselCenter / 2) - (this.bookWidth / 2);
    }
    
    // Aplicar escala según la posición relativa
    let scale = 1;
    if (relativeIndex !== 0) {
      // Reducir escala para libros no activos
      scale = 0.92;
      
      // Libros más alejados se hacen aún más pequeños
      if (Math.abs(relativeIndex) > 1) {
        scale = 0.85;
      }
    }
    
    return `translateX(${position}px) scale(${scale})`;
  }

  /**
   * Navegar al libro siguiente
   */
  nextBook() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.finishedBooks.length;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Duración de la transición
  }

  /**
   * Navegar al libro anterior
   */
  prevBook() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex - 1 + this.finishedBooks.length) % this.finishedBooks.length;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Duración de la transición
  }

  /**
   * Ir directamente a un libro específico
   */
  goToBook(index: number) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.updateSelectedBook();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 500); // Duración de la transición
  }

  /**
   * Actualizar el libro seleccionado en el servicio
   */
  updateSelectedBook() {
    if (this.currentIndex >= 0 && this.currentIndex < this.finishedBooks.length) {
      this.booksService.actualizarBookActual(this.finishedBooks[this.currentIndex]);
    }
  }

  // Soporte para gestos táctiles
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    if (this.isTransitioning) return;
    
    const touchEndX = event.changedTouches[0].clientX;
    const diff = this.touchStartX - touchEndX;
    
    // Si el deslizamiento es significativo (más de 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Deslizar a la izquierda -> siguiente
        this.nextBook();
      } else {
        // Deslizar a la derecha -> anterior
        this.prevBook();
      }
    }
  }

  formatDate(date: Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
    /**
   * Calcula la opacidad para cada libro basado en su posición
   */
    getBookOpacity(index: number): number {
      // Usar el mismo método para calcular el índice relativo que usamos en otras funciones
      let relativeIndex = this.getRelativeIndex(index);
      
      // En modo móvil (1 libro visible)
      if (this.itemsToShow === 1) {
        // Solo mostrar el libro activo
        if (relativeIndex === 0) {
          return 1;
        } 
        // Elementos adjacentes con baja opacidad
        else if (Math.abs(relativeIndex) === 1) {
          return 0.3;
        }
        // Resto de elementos ocultos
        else {
          return 0;
        }
      }
      
      // En modo tablet (2 libros visibles)
      else if (this.itemsToShow === 2) {
        // Libro activo con opacidad completa
        if (relativeIndex === 0) {
          return 1;
        }
        // Libro siguiente con alta opacidad
        else if (relativeIndex === 1) {
          return 0.9;
        }
        // Libro anterior con opacidad media
        else if (relativeIndex === -1) {
          return 0.7;
        }
        // Libro +2 con baja opacidad
        else if (relativeIndex === 2) {
          return 0.3;
        }
        // Resto de elementos ocultos
        else {
          return 0;
        }
      }
      
      // En modo escritorio (3 libros visibles)
      else {
        // Libro activo con opacidad completa
        if (relativeIndex === 0) {
          return 1;
        }
        // Libros adjacentes (derecha e izquierda) con opacidad media-alta
        else if (Math.abs(relativeIndex) === 1) {
          return 0.8;
        }
        // Libro a la derecha del adjacente derecho con baja opacidad
        else if (relativeIndex === 2) {
          return 0.4;
        }
        // Libro a la izquierda del adjacente izquierdo con baja opacidad
        else if (relativeIndex === -2) {
          return 0.4;
        }
        // Resto de elementos ocultos
        else {
          return 0;
        }
      }
    }
    
    /**
     * Calcula el índice relativo del libro respecto al libro activo
     */
    getRelativeIndex(index: number): number {
      let relativeIndex = index - this.currentIndex;
      
      // Ajustar para bucle infinito
      if (relativeIndex < -Math.floor(this.finishedBooks.length / 2)) {
        relativeIndex += this.finishedBooks.length;
      } else if (relativeIndex > Math.floor(this.finishedBooks.length / 2)) {
        relativeIndex -= this.finishedBooks.length;
      }
      
      return relativeIndex;
    }
}