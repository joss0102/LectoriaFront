// nav-horizontal.component.ts
import { Component, OnInit } from '@angular/core';
import { DividerTimerComponent } from '../divider-timer/divider-timer.component';
import { RouterModule } from '@angular/router';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/ThemeService/theme.service';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [DividerTimerComponent, RouterModule, CommonModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss',
})
export class NavHorizontalComponent implements OnInit {
  modoNoche: boolean = true;
  
  constructor(
    private navService: NavVerticalService,
    private themeService: ThemeService
  ) {}
  
  ngOnInit() {
    // Suscribirse al servicio de tema
    this.themeService.modoNoche$.subscribe(modo => {
      this.modoNoche = modo;
    });
  }
  
  toggleNav() {
    this.navService.toggleIcons();
  }
  
  toggleTema() {
    this.themeService.toggleTema();
  }
}