import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/book/book.service';
import { Book } from '../../../../../../core/models/book-model';


interface Saga {
  nombre: string;
  fondos: string[];
}

@Component({
  selector: 'app-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './images.component.html',
  styleUrl: './images.component.scss'
})
export class ImagesComponent implements OnInit {
  // Lista de todos los libros
  libros: Book[] = [];
  
  // Lista de sagas y sus imágenes
  sagas: Saga[] = [];
  
  // Vista activa (libros o sagas)
  vistaActiva: 'libros' | 'sagas' = 'libros';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.libros = this.bookService.getAllBooks();
    
    // Extraer las sagas únicas de los libros
    const sagasUnicas = new Set<string>();
    this.libros.forEach(libro => {
      if (libro.saga && libro.saga.trim() !== '') {
        sagasUnicas.add(libro.saga);
      }
    });
    
    // Crear el array de sagas con sus rutas de imágenes
    this.sagas = Array.from(sagasUnicas).map(saga => ({
      nombre: saga,
      fondos: [
        `/libros/${saga}/fondos/fondo1.jpg`,
        `/libros/${saga}/fondos/fondo2.jpg`
      ]
    }));
  }

  // Cambiar entre vistas de libros y sagas
  cambiarVista(vista: 'libros' | 'sagas'): void {
    this.vistaActiva = vista;
  }
  
  // Método placeholder para la funcionalidad de edición
  editarImagen(tipo: 'libro' | 'saga', id: string): void {
    console.log(`Editar imagen de ${tipo}: ${id}`);
    // Aquí se implementaría la lógica para editar la imagen
  }
}