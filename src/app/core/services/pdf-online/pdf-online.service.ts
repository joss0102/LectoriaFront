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
  volumeInfo: {
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
    series?: string;
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

  uploadPdf(file: File, bookTitle?: string): Observable<PdfSearchResponse> {
    console.log(`Preparando para subir PDF: ${file.name}, tamaño: ${file.size} bytes`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (bookTitle && bookTitle.trim() !== '') {
      console.log(`Usando título de búsqueda: "${bookTitle}"`);
      formData.append('bookTitle', bookTitle.trim());
    }
    
    console.log('FormData contiene las siguientes claves:');
    formData.forEach((value, key) => {
      console.log(`- ${key}: ${value instanceof File ? 'File object' : value}`);
    });

    const uploadUrl = `${this.apiUrl}/upload`;
    console.log(`Enviando solicitud a: ${uploadUrl}`);
    
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

  searchByIsbn(isbn: string): Observable<GoogleBookResponse> {
    return this.http.get<GoogleBookResponse>(`${this.apiUrl}/search/isbn/${isbn}`)
      .pipe(
        tap(response => console.log('Respuesta de búsqueda por ISBN:', response)),
        retry(1),
        catchError(this.handleError)
      );
  }

  searchBooks(query: string): Observable<GoogleBookResponse> {
    const encodedQuery = encodeURIComponent(query);
    return this.http.get<GoogleBookResponse>(`${this.apiUrl}/search?q=${encodedQuery}`)
      .pipe(
        tap(response => console.log('Respuesta de búsqueda general:', response)),
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error completo:', error);
    
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
      console.error('Error del cliente:', error.error);
    } else if (error.error instanceof ProgressEvent && error.error.type === 'error') {
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