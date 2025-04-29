import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface GoogleBookResponse {
  items?: GoogleBookItem[];
  totalItems?: number;
  kind?: string;
}

export interface GoogleBookItem {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type?: string;
      identifier?: string;
    }>;
    previewLink?: string;
  };
}

export interface PdfSearchResponse {
  message: GoogleBookResponse;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnlinePdfService {
  private apiUrl = `${environment.apiUrl}/pdf-books`;

  constructor(private http: HttpClient) {
    console.log('OnlinePdfService inicializado');
    console.log('API URL configurada:', this.apiUrl);
  }

/**
 * Sube un archivo PDF para buscar información de libros
 * @param file Archivo PDF a procesar
 * @param bookTitle Título del libro (opcional)
 * @returns Observable con la información de los libros encontrados
 */
uploadPdf(file: File, bookTitle?: string): Observable<PdfSearchResponse> {
  console.log(`Preparando para subir PDF: ${file.name}, tamaño: ${file.size} bytes`);
  
  const formData = new FormData();
  // Asegurarse de usar el nombre de parámetro correcto según el backend
  formData.append('file', file);
  
  if (bookTitle && bookTitle.trim() !== '') {
    console.log(`Usando título de búsqueda: "${bookTitle}"`);
    formData.append('bookTitle', bookTitle.trim());
  }
  
  // Mostrar todas las claves del FormData para debug
  console.log('FormData contiene las siguientes claves:');
  formData.forEach((value, key) => {
    console.log(`- ${key}: ${value instanceof File ? 'File object' : value}`);
  });

  const uploadUrl = `${this.apiUrl}/upload`;
  console.log(`Enviando solicitud a: ${uploadUrl}`);
  
  // Añadir headers para depuración - sin content-type para que el navegador lo configure automáticamente
  const headers = new HttpHeaders({
    'X-Debug-Info': 'true'
  });
  
  return this.http.post<PdfSearchResponse>(uploadUrl, formData, { headers })
    .pipe(
      tap(response => console.log('Respuesta exitosa del servidor:', response)),
      retry(1),
      catchError(this.handleError)
    );
}

  /**
   * Busca información de un libro por su ISBN
   * @param isbn ISBN del libro
   * @returns Observable con la información del libro
   */
  searchByIsbn(isbn: string): Observable<GoogleBookResponse> {
    return this.http.get<GoogleBookResponse>(`${this.apiUrl}/search/isbn/${isbn}`)
      .pipe(
        tap(response => console.log('Respuesta de búsqueda por ISBN:', response)),
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Busca información de libros por título y/o autor
   * @param query Términos de búsqueda (título y/o autor)
   * @returns Observable con la información de los libros encontrados
   */
  searchBooks(query: string): Observable<GoogleBookResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<GoogleBookResponse>(`${this.apiUrl}/search?q=${encodedQuery}`)
      .pipe(
        tap(response => console.log('Respuesta de búsqueda general:', response)),
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores de la API
   */
  private handleError(error: HttpErrorResponse) {
    console.error('Error completo:', error);
    
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
      console.error('Error del cliente:', error.error);
    } else if (error.error instanceof ProgressEvent && error.error.type === 'error') {
      // Error de conexión
      errorMessage = 'Error de conexión al servidor. Verifica que el backend esté funcionando correctamente.';
      console.error('Error de conexión:', error);
    } else {
      // Error del servidor
      console.error(
        `Error del servidor ${error.status}, ` +
        `cuerpo: ${JSON.stringify(error.error)}`
      );
      
      errorMessage = error.error?.error || error.error?.message || error.statusText || 'Error del servidor';
    }
    
    // Información adicional para diagnóstico
    console.error('URL que falló:', error.url);
    console.error('Método HTTP:', error.status);
    console.error('Mensaje de error:', errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}