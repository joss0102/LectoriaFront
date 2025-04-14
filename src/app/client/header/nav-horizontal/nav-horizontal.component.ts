import { Component, OnInit, OnDestroy } from '@angular/core';
import { DividerTimerComponent } from '../divider-timer/divider-timer.component';
import { RouterModule } from '@angular/router';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeType } from '../../../core/services/ThemeService/theme.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-nav-horizontal',
  standalone: true,
  imports: [DividerTimerComponent, RouterModule, CommonModule],
  templateUrl: './nav-horizontal.component.html',
  styleUrl: './nav-horizontal.component.scss',
})
export class NavHorizontalComponent implements OnInit, OnDestroy {
  modoNoche: boolean = true;
  currentTheme: ThemeType = 'noche';
  showLinks: boolean = true;
  isHomePage: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  isLoginPage: boolean = false;
  
  private themeSubscription: Subscription | undefined;
  private themeTypeSubscription: Subscription | undefined;
  private linksSubscription: Subscription | undefined;
  private homePageSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;
  private routerSubscription: Subscription | undefined;
  
  constructor(
    private navService: NavVerticalService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.themeSubscription = this.themeService.modoNoche$.subscribe(modo => {
      this.modoNoche = modo;
    });
    this.themeTypeSubscription = this.themeService.temaActual$.subscribe(tema => {
      this.currentTheme = tema;
    });
    
    this.linksSubscription = this.navService.linksInHorizontalNav$.subscribe(visible => {
      this.showLinks = visible;
    });
    
    this.homePageSubscription = this.navService.isHomePage$.subscribe(isHome => {
      this.isHomePage = isHome;
    });

    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
    });

    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.currentUserValue;
      this.isAdmin = user?.role === 'admin';
    }

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isLoginPage = event.urlAfterRedirects === '/login';
      });

    this.isLoginPage = this.router.url === '/login';
  }
  
  toggleNav() {
    // Si estamos en página de inicio, siempre mostramos/ocultamos el menú
    // independientemente del tamaño de pantalla
    if (this.isHomePage) {
      const menuVisible = this.navService.getMenuVisible();
      this.navService.setMenuVisible(!menuVisible);
    } else {
      // Comportamiento normal para otras páginas
      if (window.innerWidth > 1300) {
        this.navService.toggleIcons();
      } else {
        const menuVisible = this.navService.getMenuVisible();
        this.navService.setMenuVisible(!menuVisible);
      }
    }
  }
  
  toggleTema() {
    // Si estamos en un tema personalizado (ártico, bosque, atardecer),
    // regresar al modo día/noche básico antes de alternar
    if (!['noche', 'dia'].includes(this.currentTheme)) {
      const shouldBeNight = !this.isDarkTheme;
      this.themeService.setTemaPersonalizado(shouldBeNight ? 'noche' : 'dia');
    } else {
      this.themeService.toggleTema();
    }
  }
  
  // Determina si el tema actual es oscuro
  get isDarkTheme(): boolean {
    return ['noche', 'bosque'].includes(this.currentTheme);
  }
  
  // Obtiene las clases para el interruptor según el tema
  get themeToggleClasses(): any {
    const classes: any = {};
    
    if (this.currentTheme === 'artico') {
      classes['theme-arctic'] = true;
    } else if (this.currentTheme === 'bosque') {
      classes['theme-forest'] = true;
    } else if (this.currentTheme === 'atardecer') {
      classes['theme-sunset'] = true;
    }
    
    return classes;
  }
  
  // Obtiene el título para el interruptor del tema
  getThemeToggleTitle(): string {
    if (this.isDarkTheme) {
      return `Cambiar a modo claro (Tema actual: ${this.getThemeName()})`;
    } else {
      return `Cambiar a modo oscuro (Tema actual: ${this.getThemeName()})`;
    }
  }
  
  // Obtiene el nombre amigable del tema actual
  getThemeName(): string {
    switch(this.currentTheme) {
      case 'noche': return 'Noche';
      case 'dia': return 'Día';
      case 'artico': return 'Ártico';
      case 'bosque': return 'Bosque';
      case 'atardecer': return 'Atardecer';
      default: return 'Personalizado';
    }
  }
  shouldShowMenuButton(): boolean {
    return this.isLoggedIn && !this.isLoginPage;
  }
  
  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.themeTypeSubscription) {
      this.themeTypeSubscription.unsubscribe();
    }
    if (this.linksSubscription) {
      this.linksSubscription.unsubscribe();
    }
    if (this.homePageSubscription) {
      this.homePageSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}