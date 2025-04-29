import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthorService } from '../../../core/services/call-api/author.service';
import { BookService } from '../../../core/services/call-api/book.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';

import { Author } from '../../../core/models/call-api/author.model';
import { UserBook } from '../../../core/models/call-api/book.model';
import { SearchService } from '../../../core/services/SearchService/search.service';

@Component({
  selector: 'app-data-author',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-author.component.html',
  styleUrls: ['./data-author.component.scss'],
})
export class DataAuthorComponent implements OnInit {
  currentUser: string = '';
  topAuthors: { author: Author; count: number }[] = [];

  constructor(
    private authService: AuthService,
    private authorService: AuthorService,
    private bookService: BookService,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  /**
   * Obtiene el usuario actual desde el servicio `AuthService` y, si está disponible,
   * carga los libros del usuario.
   */
  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      this.loadUserBooks();
    }
  }

  /**
   * Carga los libros del usuario actual utilizando el servicio `BookService`.
   * Obtiene los detalles de los libros con sus autores y luego procesa los autores más leídos.
   */
  loadUserBooks(): void {
    this.bookService
      .getUserBooks(this.currentUser, undefined, 1, 1000)
      .subscribe((response) => {
        const userBooks: UserBook[] = response.data || [];
        if (userBooks.length === 0) return;

        this.bookService
          .getBooksWithCache(userBooks.map((book) => book.book_id))
          .subscribe((bookDetails) => {
            const enrichedBooks = userBooks.map((book) => {
              const details = bookDetails.find(
                (d) => d.book_id === book.book_id
              );
              return {
                ...book,
                authors: details?.authors || book.authors || '',
              };
            });

            this.processTopAuthors(enrichedBooks);
          });
      });
  }

  /**
   * Procesa los libros del usuario para contar la cantidad de libros leidos de cada autor.
   * Luego, obtiene los autores del servicio `AuthorService` y clasifica los más leidos.
   * Solo mantiene a los autores con al menos un libro leido.
   */
  processTopAuthors(books: UserBook[]): void {
    const authorCountMap = new Map<string, { name: string; count: number }>();

    books.forEach((book) => {
      if (!book.authors) return;

      const authorNames = book.authors.split(',').map((name) => name.trim());
      authorNames.forEach((name) => {
        const key = name.toLowerCase();
        if (!authorCountMap.has(key)) {
          authorCountMap.set(key, { name, count: 1 });
        } else {
          authorCountMap.get(key)!.count++;
        }
      });
    });

    this.authorService.getAllAuthors().subscribe((response) => {
      const authors = response.data || [];

      const rankedAuthors = authors
        .map((author) => {
          const fullName = this.getAuthorFullName(author);
          const key = fullName.toLowerCase();
          const count = authorCountMap.get(key)?.count || 0;
          return { author, count };
        })
        .filter((item) => item.count > 0);

      rankedAuthors.sort((a, b) => b.count - a.count);
      this.topAuthors = rankedAuthors.slice(0, 5);
    });
  }

  /**
   * Obtiene el nombre completo de un autor a partir de su nombre y apellidos.
   * @param author El objeto autor.
   * @returns El nombre completo del autor.
   */
  getAuthorFullName(author: Author): string {
    let fullName = author.name || '';
    if (author.last_name1) {
      fullName += ' ' + author.last_name1;
    }
    if (author.last_name2) {
      fullName += ' ' + author.last_name2;
    }
    return fullName.trim();
  }

  /**
   * Genera la URL de la imagen del autor basada en su nombre completo.
   * @param author El objeto autor.
   * @returns La URL de la imagen del autor.
   */
  getAuthorImageUrl(author: Author): string {
    if (!author?.name) return '/assets/images/default-author.jpg';

    const fullName = this.getAuthorFullName(author);
    return `/autores/${fullName}/autor/${fullName}.jpg`;
  }

  /**
   * Navega al componente `Search` con los detalles del autor seleccionado.
   * Resetea el estado anterior del servicio de búsqueda y realiza un pequeño retraso
   * para asegurar que el autor seleccionado sea cargado correctamente antes de la navegación.
   * @param author El autor seleccionado.
   */
  showAuthorDetails(author: Author): void {
    if (author && author.id) {
      // Resetear el estado anterior para asegurar que se cargue el nuevo autor
      this.searchService.resetSelectedItem();
      // Pequeño delay para asegurar que el reseteo surta efecto
      setTimeout(() => {
        // Seleccionar el autor en el servicio de búsqueda
        this.searchService.selectItemById(author.id, 'author');
        // Navegar al componente Search con los parámetros del autor
        this.router.navigate(['/search'], {
          queryParams: {
            id: author.id,
            type: 'author',
          },
        });
      }, 50);
    }
  }
}
