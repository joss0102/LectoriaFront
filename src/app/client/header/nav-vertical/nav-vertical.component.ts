import { Component } from '@angular/core';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-vertical',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-vertical.component.html',
  styleUrl: './nav-vertical.component.scss',
})
export class NavVerticalComponent {
  onlyIcon: boolean = true;
  constructor(private verticalService: NavVerticalService) {
    this.verticalService.onlyIcon$.subscribe((value) => {
      this.onlyIcon = value;
    });
  }
}
