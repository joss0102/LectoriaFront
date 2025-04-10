import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/book/book.service';
import { Book } from '../../../../../../core/models/book-model';

interface Saga {
  nombre: string;
  fondos: string[];
}

interface Autor {
  nombre: string;
  libros: Book[];
  banners: string[];
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
  
  // Lista de autores y sus imágenes
  autores: Autor[] = [];
  
  // Vista activa (libros, sagas, autores o banners)
  vistaActiva: 'libros' | 'sagas' | 'autores' | 'banners' = 'libros';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Obtener todos los libros
    this.libros = this.bookService.getAllBooks();
    
    // Extraer las sagas únicas de los libros
    this.extraerSagas();
    
    // Extraer los autores únicos de los libros
    this.extraerAutores();
  }

  // Extraer sagas únicas y sus fondos
  private extraerSagas(): void {
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
    
    // Ordenar sagas alfabéticamente
    this.sagas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }
  
  // Extraer autores únicos y sus libros
  private extraerAutores(): void {
    const autoresMap = new Map<string, Book[]>();
    
    this.libros.forEach(libro => {
      if (!autoresMap.has(libro.autor)) {
        autoresMap.set(libro.autor, []);
      }
      autoresMap.get(libro.autor)?.push(libro);
    });
    
    // Crear el array de autores con sus rutas de imágenes
    this.autores = Array.from(autoresMap).map(([nombre, libros]) => ({
      nombre,
      libros,
      banners: [
        `/autores/${nombre}/banner/fondo1.jpg`,
        `/autores/${nombre}/banner/fondo1.jpg`,
      ]
    }));
    
    // Ordenar autores alfabéticamente
    this.autores.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  // Cambiar entre vistas
  cambiarVista(vista: 'libros' | 'sagas' | 'autores' | 'banners'): void {
    this.vistaActiva = vista;
  }
  
  // Método para la funcionalidad de edición de imágenes
  editarImagen(tipo: 'libro' | 'saga' | 'autor' | 'banner', id: string): void {
    console.log(`Editar imagen de ${tipo}: ${id}`);
    // Aquí se implementaría la lógica para editar la imagen
    // Por ejemplo, abrir un modal para cargar una nueva imagen
  }
}