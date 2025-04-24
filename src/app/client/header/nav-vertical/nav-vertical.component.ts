import { Component, Renderer2, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { NavVerticalService } from '../../../core/services/NavVerticalService/NavVertical.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { ThemeService } from '../../../core/services/ThemeService/theme.service';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

import { SearchService,SearchResult } from '../../../core/services/SearchService/search.service';

@Component({
  selector: 'app-nav-vertical',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './nav-vertical.component.html',
  styleUrl: './nav-vertical.component.scss',
})
export class NavVerticalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('searchMenuWrapper') searchMenuWrapper: ElementRef | undefined;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  onlyIcon: boolean = true;
  menuVisible: boolean = false;
  searchMenuVisible = false;
  searchQuery = '';
  searchResults: SearchResult[] = [];
  recentSearches: SearchResult[] = [];
  isSearching = false;
  isMobile: boolean = false;
  modoNoche: boolean = true;
  showMainLinks: boolean = false;
  isHomePage: boolean = false;
  isLoginPage: boolean = false;
  
  private iconSubscription: Subscription;
  private menuVisibleSubscription: Subscription;
  private themeSubscription: Subscription;
  private linksSubscription: Subscription;
  private responsiveSubscription: Subscription;
  private routerSubscription: Subscription;
  private searchSubscription: Subscription | null = null;
  
  constructor(
    private verticalService: NavVerticalService,
    private themeService: ThemeService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    private authService: AuthService,
    private searchService: SearchService
  ) {
    // Detectar si es dispositivo móvil al inicio
    this.checkIsMobile();
    
    // Suscripción para el estado de iconos (expandido/colapsado)
    this.iconSubscription = this.verticalService.onlyIcon$.subscribe((value) => {
      this.onlyIcon = value;
      
      // Actualizar la posición del buscador
      setTimeout(() => this.updateSearchMenuPosition(), 0);
    });
    
    // Suscripción para la visibilidad del menú en responsive
    this.menuVisibleSubscription = this.verticalService.menuVisible$.subscribe((value) => {
      this.menuVisible = value;
      
      // Añadir/quitar clase para prevenir scroll del body en móvil
      if (this.isMobile) {
        if (value) {
          this.renderer.addClass(document.body, 'mobile-menu-open');
        } else {
          this.renderer.removeClass(document.body, 'mobile-menu-open');
        }
      }
      
      // Si cerramos el menú, cerramos también el buscador
      if (!value) {
        this.searchMenuVisible = false;
      }
      
      // Actualizar la posición del buscador
      setTimeout(() => this.updateSearchMenuPosition(), 0);
    });
    
    // Suscripción al servicio de tema
    this.themeSubscription = this.themeService.modoNoche$.subscribe((value) => {
      this.modoNoche = value;
    });
    
    // Suscripción para saber si mostrar los enlaces principales en el nav vertical
    this.linksSubscription = this.verticalService.linksInHorizontalNav$.subscribe((inHorizontal) => {
      this.showMainLinks = !inHorizontal;
    });
    
    // Suscripción para saber si estamos en modo responsive
    this.responsiveSubscription = this.verticalService.isResponsive$.subscribe((isResponsive) => {
      this.isMobile = isResponsive;
    });

    // Suscripción para detectar cambios en la ruta y verificar si estamos en la página de inicio o login
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const newIsHomePage = url === '/';
        const newIsLoginPage = url === '/login';
        
        // Si estamos entrando a la página de inicio, ocultamos el menú
        if (newIsHomePage && !this.isHomePage) {
          this.verticalService.setMenuVisible(false);
        }
        
        this.isHomePage = newIsHomePage;
        this.isLoginPage = newIsLoginPage;
        
        // Actualizar el estado en el servicio
        this.verticalService.setIsHomePage(this.isHomePage);
      });
      
    // Verificar la ruta actual al iniciar el componente
    this.isHomePage = this.router.url === '/';
    this.isLoginPage = this.router.url === '/login';
    
    // Si estamos en la página de inicio, aseguramos que el menú esté oculto inicialmente
    if (this.isHomePage) {
      this.verticalService.setMenuVisible(false);
    }
    this.verticalService.setIsHomePage(this.isHomePage);
    
    // Cargar búsquedas recientes
    this.loadRecentSearches();
  }
  
  ngAfterViewInit() {
    // Actualizar posición inicial del buscador
    this.updateSearchMenuPosition();
    
    // Configurar búsqueda reactiva
    if (this.searchInput && this.searchInput.nativeElement) {
      const searchInput = this.searchInput.nativeElement;
      
      this.searchSubscription = of(searchInput).pipe(
        switchMap(input => {
          const valueChanges = new Observable<Event>(observer => {
            const handler = (e: Event) => observer.next(e);
            input.addEventListener('input', handler);
            return () => input.removeEventListener('input', handler);
          });
          return valueChanges;
        }),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => {
          const query = this.searchQuery.trim();
          if (query.length >= 2) {
            this.isSearching = true;
            return this.searchService.search(query);
          } else {
            return of([]);
          }
        })
      ).subscribe(
        results => {
          this.searchResults = results;
          this.isSearching = false;
        },
        error => {
          console.error('Error en la búsqueda:', error);
          this.isSearching = false;
        }
      );
    }
  }
  
  // Escuchar cambios de tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIsMobile();
    this.updateSearchMenuPosition();
  }
  
  // Verificar si es dispositivo móvil
  private checkIsMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 1300;
    
    if (!this.isMobile && wasMobile) {
      // Si pasamos de móvil a desktop, eliminar la clase mobile-menu-open
      this.renderer.removeClass(document.body, 'mobile-menu-open');
    }
  }
  
  // Actualizar la posición del menú de búsqueda basado en el estado del nav
  private updateSearchMenuPosition() {
    if (!this.searchMenuWrapper) return;
    
    const searchElement = this.searchMenuWrapper.nativeElement;
    
    if (this.isMobile) {
      // En móvil, el buscador siempre tiene left: 0 cuando es visible
      this.renderer.setStyle(searchElement, 'left', '0');
    } else {
      // En desktop, la posición depende del estado del menú
      const navWidth = this.onlyIcon ? 75 : 220;
      this.renderer.setStyle(searchElement, 'left', `${navWidth}px`);
    }
  }
  
  // Toggle para el buscador
  toggleSearchMenu() {
    this.searchMenuVisible = !this.searchMenuVisible;
    
    // En móvil, si abrimos el buscador aseguramos que el menú esté visible
    if (this.searchMenuVisible && this.isMobile) {
      this.verticalService.setMenuVisible(true);
    }
    
    // Cargar búsquedas recientes al abrir el buscador
    if (this.searchMenuVisible) {
      this.loadRecentSearches();
    }
    
    // Actualizar la posición del buscador después de cambiar la visibilidad
    setTimeout(() => this.updateSearchMenuPosition(), 0);
  }
  
  // Cargar búsquedas recientes
  loadRecentSearches() {
    this.recentSearches = this.searchService.getRecentSearches();
  }
  
  // Limpiar búsquedas recientes
  clearRecentSearches() {
    this.searchService.clearRecentSearches();
    this.recentSearches = [];
  }
  
  // Seleccionar un resultado de búsqueda o búsqueda reciente
  selectSearchResult(result: SearchResult) {
    this.searchService.selectItem(result);
    this.navigateToSearch();
  }
  
  // Navegar a la página de búsqueda
  navigateToSearch() {
    this.searchMenuVisible = false;
    if (this.isMobile) {
      this.verticalService.setMenuVisible(false);
    }
    this.router.navigate(['/search']);
  }
  
  // Cerrar todos los menús (para el overlay)
  closeAllMenus() {
    this.searchMenuVisible = false;
    this.verticalService.setMenuVisible(false);
  }
  
  // Método para cerrar sesión
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        // Incluso si hay un error, intentamos navegar al login
        this.router.navigate(['/login']);
      }
    });
  }
  
  // Determinar si el nav vertical debe mostrarse
  shouldShowNavVertical(): boolean {
    return !this.isLoginPage;
  }
  
  // Limpiar suscripciones al destruir el componente
  ngOnDestroy() {
    this.iconSubscription?.unsubscribe();
    this.menuVisibleSubscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
    this.linksSubscription?.unsubscribe();
    this.responsiveSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    
    // Limpiar clases en el body
    this.renderer.removeClass(document.body, 'mobile-menu-open');
  }
}