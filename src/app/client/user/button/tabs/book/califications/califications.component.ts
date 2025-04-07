import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/book/book.service';

import { Book } from '../../../../../../core/models/book-model';

@Component({
  selector: 'app-califications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.scss'
})
export class CalificationsComponent implements OnInit {
  // Libros valorados (con valoración)
  librosValorados: Book[] = [];
  
  // Top 3 libros (para el podio)
  topLibros: Book[] = [];

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    const todosLosLibros = this.bookService.getAllBooks();
    
    // Filtrar solo los que tienen valoración
    this.librosValorados = todosLosLibros.filter(libro => libro.valoracion !== undefined)
      .sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0)); // Ordenar por valoración descendente
    
    // Obtener los 3 mejor valorados para el podio
    this.topLibros = this.librosValorados.slice(0, 3);
  }

  // Método para generar un array con el número de estrellas para mostrar visualmente
  getEstrellas(valoracion: number | undefined): number[] {
    if (!valoracion) return [];
    return Array(Math.floor(valoracion)).fill(0);
  }

  // Método para generar un array con las estrellas vacías
  getEstrellasVacias(valoracion: number | undefined): number[] {
    if (!valoracion) return [];
    return Array(5 - Math.floor(valoracion)).fill(0);
  }
}