import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Book {
  genres: string[];
  genresColors: string[];
  title: string;
  description: string;
  coverImage: string;
  backgroundImage: string;
}

@Component({
  selector: 'app-carousel-wish',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-wish.component.html',
  styleUrl: './carousel-wish.component.scss',
})
export class CarouselWishComponent implements OnInit {
  books: Book[] = [
    {
      genres: ['Trono de Cristal', 'Romance', 'Fantasía'],
      genresColors: ['bg-info text-dark', 'bg-primary', 'bg-danger'],
      title: 'Trono de Cristal',
      description:
        'En un reino donde la magia ha sido prohibida, una joven asesina es liberada de su prisión para competir contra los guerreros más letales del reino. Lo que comienza como una lucha por la libertad se convierte en una batalla por el destino de todo el mundo, mientras fuerzas oscuras conspiran en las sombras.',
      coverImage:
        '/libros/El principe cautivo/covers/El juego del principe.png',
      backgroundImage: '/fondos/fondo_tog.jpg',
    },
    {
      genres: ['Mi Alma es Tuya', 'Romance', 'Drama'],
      genresColors: ['bg-info text-dark', 'bg-primary', 'bg-success'],
      title: 'Mi Alma es Tuya',
      description:
        'Una historia de amor prohibido entre una humana y un ángel caído. Cuando el destino los une, descubren que su conexión va más allá de lo terrenal, desatando una guerra entre el cielo y el infierno. ¿Podrá su amor sobrevivir cuando todo el universo conspira en su contra?',
      coverImage: '/libros/Alma/covers/Mi alma es tuya.png',
      backgroundImage: '/libros/Alma/fondos/fondo1.jpg',
    },
  ];
  ngOnInit(): void {
    setInterval(() => {
      this.nextSlide();
    }, 10000); // Cambiar cada 10 segundos
  }

  currentIndex = 0;

  prevSlide(): void {
    this.currentIndex =
      this.currentIndex > 0 ? this.currentIndex - 1 : this.books.length - 1;
  }

  nextSlide(): void {
    this.currentIndex =
      this.currentIndex < this.books.length - 1 ? this.currentIndex + 1 : 0;
  }
}
