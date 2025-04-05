import { NgFor } from '@angular/common';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';

interface Book {
  image: string;
  title: string;
  author: string;
  pages: number;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [NgFor],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.scss'],
})
export class CarruselComponent implements OnInit, AfterViewInit {
  @ViewChild('sliderTrack') sliderTrack!: ElementRef;

  books: Book[] = [
    {
      image: '/libros/Trono de cristal/covers/Reina de sombras.png',
      title: 'Reina de Sombras',
      author: 'SARAH J. MAAS',
      pages: 888,
      startDate: '2024-11-01',
      endDate: '2024-11-02',
    },
    {
      image: '/libros/Trono de cristal/covers/Trono de cristal.png',
      title: 'Trono de Cristal',
      author: 'SARAH J. MAAS',
      pages: 432,
      startDate: '2023-05-10',
      endDate: '2023-05-25',
    },
    {
      image: '/libros/Acotar/covers/Una corte de rosas y espinas.png',
      title: 'Corte de Espinas y Rosas',
      author: 'SARAH J. MAAS',
      pages: 448,
      startDate: '2023-08-15',
      endDate: '2023-08-30',
    },
    {
      image: '/libros/Acotar/covers/Una corte de niebla y furia.png',
      title: 'Corte de Niebla y Furia',
      author: 'SARAH J. MAAS',
      pages: 640,
      startDate: '2023-09-01',
      endDate: '2023-09-20',
    },
    {
      image: '/libros/Acotar/covers/Una corte de alas y ruina.png',
      title: 'Corte de Alas y Ruina',
      author: 'SARAH J. MAAS',
      pages: 720,
      startDate: '2023-10-05',
      endDate: '2023-10-25',
    },
  ];

  displayBooks: Book[] = [];
  currentIndex = 0;
  isTransitioning = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Triplicar los libros para el carrusel infinito
    this.displayBooks = [...this.books, ...this.books, ...this.books];
  }

  ngAfterViewInit() {
    // Iniciar en el conjunto del medio
    setTimeout(() => {
      this.currentIndex = this.books.length;
      this.updatePosition(false);
      this.cdr.detectChanges();
    });
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.currentIndex--;
    this.updatePosition(true);

    // Si llegamos al inicio, resetear al conjunto medio
    if (this.currentIndex < 1) {
      setTimeout(() => {
        this.currentIndex = this.books.length;
        this.updatePosition(false);
        this.isTransitioning = false;
      }, 600);
    } else {
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.currentIndex++;
    this.updatePosition(true);

    // Si llegamos al final, resetear al conjunto medio
    if (this.currentIndex >= this.books.length * 2) {
      setTimeout(() => {
        this.currentIndex = this.books.length;
        this.updatePosition(false);
        this.isTransitioning = false;
      }, 600);
    } else {
      setTimeout(() => {
        this.isTransitioning = false;
      }, 600);
    }
  }

  updatePosition(withTransition: boolean) {
    if (!this.sliderTrack?.nativeElement) return;

    // Calcular el porcentaje de desplazamiento
    const width = window.innerWidth;
    let cardWidth = 33.333; // Escritorio: 3 tarjetas (100/3)

    if (width <= 768) {
      cardWidth = 100; // Móvil: 1 tarjeta
    } else if (width <= 992) {
      cardWidth = 50; // Tablet: 2 tarjetas
    }

    const offset = -this.currentIndex * cardWidth;

    if (!withTransition) {
      this.sliderTrack.nativeElement.style.transition = 'none';
    }

    this.sliderTrack.nativeElement.style.transform = `translateX(${offset}%)`;

    if (!withTransition) {
      // Forzar reflow
      void this.sliderTrack.nativeElement.offsetWidth;
      this.sliderTrack.nativeElement.style.transition = '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
