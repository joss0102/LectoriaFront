import { Routes } from '@angular/router';
import { LayoutComponent } from './client/layout/layout.component';
import { HomeComponent } from './client/home/home/home.component';
import { LoginComponent } from './client/features/login/login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LibraryComponent } from './client/library/library/library.component';
import { CurrentBookComponent } from './client/current-book/current-book/current-book.component';
import { StadisticsComponent } from './client/stadistics/stadistics/stadistics.component';
import { WishlistComponent } from './client/wishlist/wishlist/wishlist.component';
import { UserComponent } from './client/user/user/user.component';

import { SearchComponent } from './client/features/search/search.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthorsComponent } from './admin/author/authors/authors.component';
import { BooksComponent } from './admin/book/books/books.component';
import { UsersComponent } from './admin/user/users/users.component';
import { LayoutComponentAdmin } from './admin/layout/layout.component';

// Importar los guards
import { AuthGuard } from './core/guards/auth.guard.service';
import { AdminGuard } from './core/guards/admin.guard.service';
import { NoAuthGuard } from './core/guards/no-auth.guard.service';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'library', component: LibraryComponent,canActivate: [AuthGuard]},
      { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard]},
      { path: 'current-book', component: CurrentBookComponent,canActivate: [AuthGuard]},
      { path: 'statistics', component: StadisticsComponent,canActivate: [AuthGuard]},
      { path: 'wishlist',  component: WishlistComponent, canActivate: [AuthGuard]},
      { path: 'user', component: UserComponent,canActivate: [AuthGuard]},
      { path: 'search', component: SearchComponent },
    ],
  },

  {
    path: 'app',
    component: LayoutComponentAdmin,
    canActivate: [AdminGuard], // Proteger toda la sección de admin
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'authors', component: AuthorsComponent },
      { path: 'books', component: BooksComponent },
      { path: 'users', component: UsersComponent },
    ],
  },

  // Redirección para rutas no encontradas
  { path: '**', component: PageNotFoundComponent },
];