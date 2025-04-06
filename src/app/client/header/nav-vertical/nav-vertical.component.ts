import { Component } from '@angular/core';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nav-vertical',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nav-vertical.component.html',
  styleUrl: './nav-vertical.component.scss',
})
export class NavVerticalComponent {
  onlyIcon: boolean = true;
  searchMenuVisible = false;
  searchQuery = '';
  searchResults = ['Resultado 1', 'Resultado 2', 'Resultado 3'];
  constructor(private verticalService: NavVerticalService) {
    this.verticalService.onlyIcon$.subscribe((value) => {
      this.onlyIcon = value;
    });
  }
  toggleSearchMenu() {
    this.searchMenuVisible = !this.searchMenuVisible;
  }
}
