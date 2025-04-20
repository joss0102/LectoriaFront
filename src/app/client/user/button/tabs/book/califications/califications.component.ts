import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService } from '../../../../../../core/services/book/books.service';

import { Books } from '../../../../../../core/models/books-model';

@Component({
  selector: 'app-califications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './califications.component.html',
  styleUrl: './califications.component.scss'
})
export class CalificationsComponent implements OnInit {
  // Libros valorados (con valoración)
  librosValorados: Books[] = [];
  
  // Top 3 libros (para el podio)
  topLibros: Books[] = [];

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    const todosLosLibros = this.booksService.getAllBooks();
    
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