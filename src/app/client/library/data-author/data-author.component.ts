import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../../core/services/call-api/author.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Author } from '../../../core/models/call-api/author.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-author',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-author.component.html',
  styleUrl: './data-author.component.scss',
})
export class DataAuthorComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private authorService: AuthorService
  ) {}

  currentUser: string = '';
  authors: Author[] = [];
  topAuthors: Author[] = [];

  ngOnInit(): void {
    this.getCurrentUser();
  }
  getCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user.nickname;
      this.finalizedBooks();
    }
  }
  finalizedBooks(): void {
    this.authorService.getAllAuthors().subscribe((authorsResponse) => {
      this.authors = authorsResponse.data || [];
      console.log(this.authors);
      this.limitAuthors();
    });
  }
  limitAuthors(): void {
    this.topAuthors = this.authors.slice(0, 5);
    console.log(this.topAuthors);
  }
}
