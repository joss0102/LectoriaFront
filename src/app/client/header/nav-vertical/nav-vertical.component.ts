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
  currentUser: any = null;
  
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
    this.checkIsMobile();
    
    this.iconSubscription = this.verticalService.onlyIcon$.subscribe((value) => {
      this.onlyIcon = value;
      
      setTimeout(() => this.updateSearchMenuPosition(), 0);
    });
    
    this.menuVisibleSubscription = this.verticalService.menuVisible$.subscribe((value) => {
      this.menuVisible = value;
      
      if (this.isMobile) {
        if (value) {
          this.renderer.addClass(document.body, 'mobile-menu-open');
        } else {
          this.renderer.removeClass(document.body, 'mobile-menu-open');
        }
      }
      
      if (!value) {
        this.searchMenuVisible = false;
      }
      
      setTimeout(() => this.updateSearchMenuPosition(), 0);
    });
    
    this.themeSubscription = this.themeService.modoNoche$.subscribe((value) => {
      this.modoNoche = value;
    });
    
    this.linksSubscription = this.verticalService.linksInHorizontalNav$.subscribe((inHorizontal) => {
      this.showMainLinks = !inHorizontal;
    });
    
    this.responsiveSubscription = this.verticalService.isResponsive$.subscribe((isResponsive) => {
      this.isMobile = isResponsive;
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const newIsHomePage = url === '/';
        const newIsLoginPage = url === '/login';
        
        if (newIsHomePage && !this.isHomePage) {
          this.verticalService.setMenuVisible(false);
        }
        
        this.isHomePage = newIsHomePage;
        this.isLoginPage = newIsLoginPage;
        
        this.verticalService.setIsHomePage(this.isHomePage);
      });
      
    this.isHomePage = this.router.url === '/';
    this.isLoginPage = this.router.url === '/login';
    
    if (this.isHomePage) {
      this.verticalService.setMenuVisible(false);
    }
    this.verticalService.setIsHomePage(this.isHomePage);
    
    this.loadRecentSearches();
    
    this.currentUser = this.authService.currentUserValue;
    
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  ngAfterViewInit() {
    this.updateSearchMenuPosition();
    
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
      this.renderer.removeClass(document.body, 'mobile-menu-open');
    }
  }
  
  private updateSearchMenuPosition() {
    if (!this.searchMenuWrapper) return;
    
    const searchElement = this.searchMenuWrapper.nativeElement;
    
    if (this.isMobile) {
      this.renderer.setStyle(searchElement, 'left', '0');
    } else {
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
    
    if (this.searchMenuVisible) {
      this.loadRecentSearches();
    }
    
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
        this.router.navigate(['/login']);
      }
    });
  }
  
  // Determinar si el nav vertical debe mostrarse
  shouldShowNavVertical(): boolean {
    return !this.isLoginPage;
  }
  
  /**
   * Obtiene la URL de la imagen de perfil del usuario
   */
  getUserProfileImageUrl(): string {
    if (!this.currentUser || !this.currentUser.nickname) {
      return '/usuarios/default.png';
    }
    return `/usuarios/${this.currentUser.nickname}.png`;
  }

  /**
   * Maneja errores de carga de imagen de perfil
   */
  onProfileImageError(event: any): void {
    event.target.src = '/usuarios/default.png';
  }

  
  ngOnDestroy() {
    this.iconSubscription?.unsubscribe();
    this.menuVisibleSubscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
    this.linksSubscription?.unsubscribe();
    this.responsiveSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    
    this.renderer.removeClass(document.body, 'mobile-menu-open');
  }
}