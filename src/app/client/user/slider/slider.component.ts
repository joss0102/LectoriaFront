import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, DatePipe,NgStyle],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss'
})
export class SliderComponent implements OnInit, OnDestroy {
  // Arreglo de imágenes
  images: string[] = [
    '/libros/Los habitantes del aire/covers/El rey malvado.png',
    '/libros/Los habitantes del aire/covers/El rey malvado.png',
    '/libros/Los habitantes del aire/covers/El rey malvado.png',
    '/libros/Los habitantes del aire/covers/El rey malvado.png',
    '/libros/Los habitantes del aire/covers/El rey malvado.png'
  ];
  
  // Imagen actual mostrada
  currentImage: string = '';
  
  // Información de usuario
  userName: string = 'Usuario';
  booksCount: number = 32;
  recommendedBook: string = 'Alas de Sangre';
  currentDate: Date = new Date();
  
  // Control del tiempo
  private intervalId: any;
  private currentIndex: number = 0;
  private readonly INTERVAL_TIME: number = 10000; // 10 segundos
  
  ngOnInit(): void {
    // Iniciar con la primera imagen
    this.currentImage = this.images[0];
    
    // Iniciar la rotación automática
    this.startRotation();
  }
  
  ngOnDestroy(): void {
    // Limpiar el intervalo para evitar fugas de memoria
    this.stopRotation();
  }
  
  /**
   * Inicia la rotación automática de imágenes
   */
  private startRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentIndex];
    }, this.INTERVAL_TIME);
  }
  
  /**
   * Detiene la rotación de imágenes
   */
  private stopRotation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}