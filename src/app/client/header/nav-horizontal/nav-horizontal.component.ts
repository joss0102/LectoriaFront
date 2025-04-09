// nav-horizontal.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DividerTimerComponent } from '../divider-timer/divider-timer.component';
import { RouterModule } from '@angular/router';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/ThemeService/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [DividerTimerComponent, RouterModule, CommonModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss',
})
export class NavHorizontalComponent implements OnInit, OnDestroy {
  modoNoche: boolean = true;
  showLinks: boolean = true;
  
  private themeSubscription: Subscription | undefined;
  private linksSubscription: Subscription | undefined;
  
  constructor(
    private navService: NavVerticalService,
    private themeService: ThemeService
  ) {}
  
  ngOnInit() {
    // Suscribirse al servicio de tema
    this.themeSubscription = this.themeService.modoNoche$.subscribe(modo => {
      this.modoNoche = modo;
    });
    
    // Suscribirse al estado de los links
    this.linksSubscription = this.navService.linksInHorizontalNav$.subscribe(visible => {
      this.showLinks = visible;
    });
  }
  
  toggleNav() {
    this.navService.toggleIcons();
  }
  
  toggleTema() {
    this.themeService.toggleTema();
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.linksSubscription) {
      this.linksSubscription.unsubscribe();
    }
  }
}