import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../../../../core/services/call-api/book.service';
import { AuthorService } from '../../../../../../core/services/call-api/author.service';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { UserBook } from '../../../../../../core/models/call-api/book.model';
import { Author } from '../../../../../../core/models/call-api/author.model';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface LibroCompleto extends UserBook {
  authors?: string;
  sagas?: string;
  synopsis?: string;
  genres?: string;
}

interface AutorCompleto {
  id: number;
  nombre: string;
  apellido_completo: string;
  libros: LibroCompleto[];
  banners: string[];
}

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
  libros: LibroCompleto[] = [];
  sagas: Saga[] = [];
  autores: AutorCompleto[] = [];
  
  currentLibros: LibroCompleto[] = [];
  currentSagas: Saga[] = [];
  currentAutores: AutorCompleto[] = [];
  
  loading = true;
  error: string | null = null;
  
  vistaActiva: 'libros' | 'sagas' | 'autores' | 'banners' = 'libros';
  
  // Configuración de paginación
  currentPage: number = 1;
  pageSize: number = 12;
  totalPages: number = 0;

  constructor(
    private bookService: BookService,
    private authorService: AuthorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  /**
   * Carga todos los datos necesarios desde la API
   */
  private cargarDatos(): void {
    this.loading = true;
    this.error = null;

    const usuario = this.authService.currentUserValue;
    if (!usuario) {
      this.error = 'Usuario no autenticado';
      this.loading = false;
      return;
    }

    console.log('Cargando libros del usuario:', usuario.nickname);

    this.bookService.getUserBooks(usuario.nickname, undefined, 1, 1000)
      .pipe(
        catchError(err => {
          console.error('Error cargando libros del usuario:', err);
          return of({ data: [], pagination: { page: 1, page_size: 1000, total_items: 0, total_pages: 0 } });
        })
      )
      .subscribe(response => {
        console.log('Respuesta de getUserBooks:', response);
        if (response && response.data) {
          console.log('Libros básicos cargados:', response.data);
          
          const bookIds = response.data.map(book => book.book_id);
          console.log('IDs de libros para buscar:', bookIds);
          
          this.getBooksInBatches(bookIds)
            .pipe(
              catchError(error => {
                console.error('Error al obtener detalles de libros en batch:', error);
                return of([]);
              })
            )
            .subscribe(detailedBooks => {
              console.log('Libros detallados recibidos:', detailedBooks);
              
              const detailsMap = new Map(
                detailedBooks.map(book => [book.book_id, book])
              );
              
              this.libros = response.data.map(book => {
                const details = detailsMap.get(book.book_id);
                console.log(`Libro ${book.book_title}:`, {
                  detalles: details,
                  authors: details?.authors,
                  sagas: details?.sagas
                });
                
                return {
                  ...book,
                  authors: details?.authors || 'Autor desconocido',
                  sagas: details?.sagas || '',
                  synopsis: details?.synopsis || 'No hay sinopsis disponible',
                  genres: details?.genres || ''
                } as LibroCompleto;
              });
              
              console.log('Libros finales procesados:', this.libros);
              this.extraerSagas();
              this.cargarAutores();
              this.updatePagination();
            });
        } else {
          console.log('No se recibieron datos de libros');
          this.libros = [];
          this.sagas = [];
          this.autores = [];
          this.updatePagination();
          this.loading = false;
        }
      });
  }

  /**
   * Obtiene libros en lotes para evitar límites de la API
   */
  private getBooksInBatches(bookIds: number[]) {
    const batchSize = 50; // Tamaño del lote
    const batches = [];
    
    console.log(`Total de libros a obtener: ${bookIds.length}, dividiendo en lotes de ${batchSize}`);
    
    for (let i = 0; i < bookIds.length; i += batchSize) {
      const batch = bookIds.slice(i, i + batchSize);
      batches.push(batch);
      console.log(`Lote ${Math.floor(i/batchSize) + 1}: ${batch.length} libros (IDs: ${batch[0]} - ${batch[batch.length-1]})`);
    }
    
    const batchObservables = batches.map((batch, index) => 
      this.bookService.getBooksWithCache(batch).pipe(
        map(books => {
          console.log(`Lote ${index + 1} completado: ${books.length} libros obtenidos`);
          return books;
        }),
        catchError(error => {
          console.error(`Error en lote ${index + 1}:`, error);
          return of([]);
        })
      )
    );
    
    return forkJoin(batchObservables).pipe(
      map(batchResults => {
        const allBooks = batchResults.flat();
        console.log(`Total de libros detallados obtenidos: ${allBooks.length} de ${bookIds.length}`);
        return allBooks;
      })
    );
  }

  /**
   * Extrae las sagas únicas de los libros del usuario
   */
  private extraerSagas(): void {
    const sagasUnicas = new Set<string>();
    
    console.log('Extrayendo sagas de los libros:', this.libros);
    
    this.libros.forEach((libro, index) => {
      console.log(`Libro ${index}:`, {
        titulo: libro.book_title,
        sagas: libro.sagas,
        authors: libro.authors
      });
      
      if (libro.sagas && libro.sagas.trim() !== '') {
        const sagasLibro = libro.sagas.split(',').map(s => s.trim());
        sagasLibro.forEach(saga => {
          if (saga !== '') {
            sagasUnicas.add(saga);
          }
        });
      }
    });
    
    console.log('Sagas únicas encontradas:', Array.from(sagasUnicas));
    
    this.sagas = Array.from(sagasUnicas).map(saga => ({
      nombre: saga,
      fondos: [
        `/libros/${saga}/fondos/fondo1.jpg`,
        `/libros/${saga}/fondos/fondo2.jpg`
      ]
    }));
    
    this.sagas.sort((a, b) => a.nombre.localeCompare(b.nombre));
    console.log('Sagas procesadas:', this.sagas);
  }

  /**
   * Carga los autores desde la API
   */
  private cargarAutores(): void {
    console.log('Iniciando carga de autores...');
    
    this.authorService.getAllAuthors()
      .pipe(
        catchError(err => {
          console.error('Error cargando autores:', err);
          return of({ data: [] });
        })
      )
      .subscribe(response => {
        console.log('Respuesta de getAllAuthors:', response);
        
        if (response && response.data) {
          console.log('Autores disponibles:', response.data);
          
          const autoresConLibros = this.filtrarAutoresConLibros(response.data);
          console.log('Autores con libros del usuario:', autoresConLibros);
          
          this.cargarLibrosDeAutores(autoresConLibros);
        } else {
          console.log('No se recibieron datos de autores');
          this.autores = [];
          this.updatePagination();
          this.loading = false;
        }
      });
  }

  /**
   * Filtra los autores que tienen libros en la colección del usuario
   */
  private filtrarAutoresConLibros(todosLosAutores: Author[]): Author[] {
    console.log('Filtrando autores que tienen libros del usuario...');
    
    const autoresFiltrados = todosLosAutores.filter(autor => {
      const nombreCompleto = this.construirNombreCompleto(autor);
      console.log('Verificando autor:', nombreCompleto);
      
      const tieneLibros = this.libros.some(libro => {
        console.log(`  Comparando con libro: ${libro.book_title}, authors: ${libro.authors}`);
        return libro.authors && libro.authors.includes(nombreCompleto);
      });
      
      console.log(`  ¿Tiene libros? ${tieneLibros}`);
      return tieneLibros;
    });
    
    console.log('Autores filtrados:', autoresFiltrados);
    return autoresFiltrados;
  }

  /**
   * Carga los libros de cada autor
   */
  private cargarLibrosDeAutores(autores: Author[]): void {
    console.log('Cargando libros de autores:', autores);
    
    if (autores.length === 0) {
      console.log('No hay autores para cargar libros');
      this.autores = [];
      this.updatePagination();
      this.loading = false;
      return;
    }

    const observablesAutores = autores.map(autor => {
      console.log(`Creando observable para autor: ${this.construirNombreCompleto(autor)}`);
      
      return this.authorService.getAuthorBooks(autor.id).pipe(
        map(response => {
          console.log(`Respuesta de getAuthorBooks para ${autor.name}:`, response);
          
          const nombreCompleto = this.construirNombreCompleto(autor);
          const librosDelAutor = this.libros.filter(libro => 
            libro.authors && libro.authors.includes(nombreCompleto)
          );

          console.log(`Libros del autor ${nombreCompleto}:`, librosDelAutor);

          return {
            id: autor.id,
            nombre: nombreCompleto,
            apellido_completo: this.construirApellidoCompleto(autor),
            libros: librosDelAutor,
            banners: [
              `/autores/${nombreCompleto}/banner/banner.jpg`
            ]
          };
        }),
        catchError(err => {
          console.error(`Error cargando libros del autor ${autor.name}:`, err);
          const nombreCompleto = this.construirNombreCompleto(autor);
          return of({
            id: autor.id,
            nombre: nombreCompleto,
            apellido_completo: this.construirApellidoCompleto(autor),
            libros: [],
            banners: [
              `/autores/${nombreCompleto}/banner/banner.jpg`
            ]
          });
        })
      );
    });

    forkJoin(observablesAutores).subscribe(autoresCompletos => {
      console.log('Autores completos recibidos:', autoresCompletos);
      
      this.autores = autoresCompletos.filter(autor => autor.libros.length > 0);
      console.log('Autores finales con libros:', this.autores);
      
      this.autores.sort((a, b) => a.nombre.localeCompare(b.nombre));
      
      this.updatePagination();
      this.loading = false;
    });
  }

  /**
   * Actualiza la paginación según la vista activa
   */
  private updatePagination(): void {
    let totalItems = 0;
    
    switch (this.vistaActiva) {
      case 'libros':
        totalItems = this.libros.length;
        break;
      case 'sagas':
        totalItems = this.sagas.length;
        break;
      case 'autores':
      case 'banners':
        totalItems = this.autores.length;
        break;
    }
    
    this.totalPages = Math.ceil(totalItems / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.updateCurrentData();
  }

  /**
   * Actualiza los datos actuales según la página
   */
  private updateCurrentData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    switch (this.vistaActiva) {
      case 'libros':
        this.currentLibros = this.libros.slice(startIndex, endIndex);
        break;
      case 'sagas':
        this.currentSagas = this.sagas.slice(startIndex, endIndex);
        break;
      case 'autores':
      case 'banners':
        this.currentAutores = this.autores.slice(startIndex, endIndex);
        break;
    }
  }

  /**
   * Cambia de página
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateCurrentData();
      
      // Scroll al top de la sección
      const element = document.querySelector('.images-content');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /**
   * Construye el nombre completo del autor
   */
  private construirNombreCompleto(autor: Author): string {
    let nombreCompleto = autor.name;
    if (autor.last_name1) {
      nombreCompleto += ` ${autor.last_name1}`;
    }
    if (autor.last_name2) {
      nombreCompleto += ` ${autor.last_name2}`;
    }
    console.log(`Nombre completo construido: ${nombreCompleto}`);
    return nombreCompleto;
  }

  /**
   * Construye el apellido completo del autor para URLs
   */
  private construirApellidoCompleto(autor: Author): string {
    let apellidoCompleto = autor.name;
    if (autor.last_name1) {
      apellidoCompleto += `_${autor.last_name1}`;
    }
    if (autor.last_name2) {
      apellidoCompleto += `_${autor.last_name2}`;
    }
    console.log(`Apellido completo construido: ${apellidoCompleto}`);
    return apellidoCompleto;
  }

  /**
   * Obtiene la URL de la imagen de portada de un libro
   */
  getBookImageUrl(libro: LibroCompleto): string {
    if (!libro) {
      return '/autores/fondo-default.jpg';
    }

    try {
      if (libro.sagas) {
        // Tomar la primera saga si hay múltiples
        const primeraSaga = libro.sagas.split(',')[0].trim();
        return `/libros/${primeraSaga}/covers/${libro.book_title}.png`;
      } else {
        // URL diferente cuando no hay saga
        return `/libros/covers/${libro.book_title}.png`;
      }
    } catch (error) {
      console.error('Error construyendo URL de imagen del libro:', error);
      return '/autores/fondo-default.jpg';
    }
  }

  /**
  * Construye el nombre completo para objetos AutorCompleto
  */
  private construirNombreCompletoAutor(autor: AutorCompleto): string {
  return autor.nombre || 'Autor_Desconocido';
  }
  /**
   * Obtiene la URL de la imagen del autor
   */
  getAuthorImageUrl(autor: AutorCompleto): string {
    const nombreCompleto = this.construirNombreCompletoAutor(autor);
    if (!autor) {
      return '/autores/fondo-default.jpg';
    }

    try {
      return `/autores/${nombreCompleto}/autor/${nombreCompleto}.jpg`;
    } catch (error) {
      console.error('Error construyendo URL de imagen del autor:', error);
      return '/autores/fondo-default.jpg';
    }
  }

  /**
   * Obtiene la URL del fondo de saga
   */
  getSagaFondoUrl(sagaNombre: string, numeroFondo: number): string {
    if (!sagaNombre) {
      return '/autores/fondo-default.jpg';
    }

    try {
      return `/libros/${sagaNombre}/fondos/fondo${numeroFondo}.jpg`;
    } catch (error) {
      console.error('Error construyendo URL de fondo de saga:', error);
      return '/autores/fondo-default.jpg';
    }
  }

  /**
   * Obtiene la URL del banner de autor
   */
  getAuthorBannerUrl(autor: AutorCompleto): string {
    if (!autor) {
      return '/autores/fondo-default.jpg';
    }
    const nombreCompleto = this.construirNombreCompletoAutor(autor);
    try {
      return `/autores/${nombreCompleto}/banner/fondo1.jpg`;
    } catch (error) {
      console.error('Error construyendo URL de banner de autor:', error);
      return '/autores/fondo-default.jpg';
    }
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: any): void {
    event.target.src = '/autores/fondo-default.jpg';
  }

  /**
   * Cambia entre vistas
   */
  cambiarVista(vista: 'libros' | 'sagas' | 'autores' | 'banners'): void {
    this.vistaActiva = vista;
    this.currentPage = 1; // Reset a la primera página
    this.updatePagination();
  }
  
  /**
   * Método para la funcionalidad de edición de imágenes
   */
  editarImagen(tipo: 'libro' | 'saga' | 'autor' | 'banner', id: string): void {
    console.log(`Editar imagen de ${tipo}: ${id}`);
    // Aquí se implementaría la lógica para editar la imagen
    // Por ejemplo, abrir un modal para cargar una nueva imagen
  }

  /**
   * Recarga los datos desde la API
   */
  recargarDatos(): void {
    this.currentPage = 1;
    this.cargarDatos();
  }
}