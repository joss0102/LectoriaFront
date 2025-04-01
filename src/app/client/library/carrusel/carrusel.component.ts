import { NgFor } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

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
  styleUrls: ['./carrusel.component.scss']
})
export class CarruselComponent implements OnInit {
  @ViewChild('cardList') cardList!: ElementRef<HTMLElement>;

  currentIndex: number = 0;
  slideWidth: number = 380; // Ancho de cada tarjeta + gap
  visibleSlides: number = 3;
  isTransitioning: boolean = false;
  private animationTimeout: any;

  originalBooks: Book[] = [
    {
      image: '/libros/Trono de cristal/covers/Reina de sombras.png',
      title: 'Reina de Sombras',
      author: 'SARAH J. MAAS',
      pages: 888,
      startDate: '2024-11-01',
      endDate: '2024-11-02'
    },
    {
      image: '/libros/Trono de cristal/covers/Trono de cristal.png',
      title: 'Trono de Cristal',
      author: 'SARAH J. MAAS',
      pages: 432,
      startDate: '2023-05-10',
      endDate: '2023-05-25'
    },
    {
      image: '/libros/Acotar/covers/Una corte de rosas y espinas.png',
      title: 'Corte de Espinas y Rosas',
      author: 'SARAH J. MAAS',
      pages: 448,
      startDate: '2023-08-15',
      endDate: '2023-08-30'
    },
    {
      image: '/libros/Acotar/covers/Una corte de niebla y furia.png',
      title: 'Corte de Niebla y Furia',
      author: 'SARAH J. MAAS',
      pages: 640,
      startDate: '2023-09-01',
      endDate: '2023-09-20'
    },
    {
      image: '/libros/Acotar/covers/Una corte de alas y ruina.png',
      title: 'Corte de Alas y Ruina',
      author: 'SARAH J. MAAS',
      pages: 720,
      startDate: '2023-10-05',
      endDate: '2023-10-25'
    }
  ];

  books: Book[] = [];

  ngOnInit() {
    this.prepareBooks();
  }

  private prepareBooks() {
    this.books = [
      ...this.originalBooks.slice(-this.visibleSlides),
      ...this.originalBooks,
      ...this.originalBooks.slice(0, this.visibleSlides)
    ];
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.startTransition();

    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.updateSlidePosition(true);

    if (this.currentIndex === 0) {
      this.animationTimeout = setTimeout(() => {
        this.resetToEnd();
      }, 500);
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;
    this.startTransition();

    this.currentIndex = Math.min(this.books.length - this.visibleSlides, this.currentIndex + 1);
    this.updateSlidePosition(true);

    if (this.currentIndex === this.books.length - this.visibleSlides) {
      this.animationTimeout = setTimeout(() => {
        this.resetToStart();
      }, 500);
    }
  }

  private startTransition() {
    this.isTransitioning = true;
    clearTimeout(this.animationTimeout);
  }

  private resetToEnd() {
    this.isTransitioning = false;
    this.currentIndex = this.originalBooks.length;
    this.updateSlidePosition(false);
  }

  private resetToStart() {
    this.isTransitioning = false;
    this.currentIndex = 0;
    this.updateSlidePosition(false);
  }

  updateSlidePosition(withTransition: boolean) {
    if (!this.cardList?.nativeElement) return;

    this.cardList.nativeElement.style.transition = withTransition
      ? 'transform 0.5s ease-in-out'
      : 'none';

    const offset = this.currentIndex * this.slideWidth;
    this.cardList.nativeElement.style.transform = `translateX(-${offset}px)`;

    if (withTransition) {
      setTimeout(() => {
        if (this.currentIndex > 0 && this.currentIndex < this.books.length - this.visibleSlides) {
          this.isTransitioning = false;
        }
      }, 500);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  ngOnDestroy() {
    clearTimeout(this.animationTimeout);
  }
}