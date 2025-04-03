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
import { SearchBookComponent } from './client/features/search/search-book/search-book.component';
import { SearchAuthorComponent } from './client/features/search/search-author/search-author.component';

export const routes: Routes = [
  // User
  {
    path: '',
    component: LayoutComponent,
    children: [
      // -> www.ejemplo.com
      { path: '', component: HomeComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'login', component: LoginComponent },
      { path: 'current-book', component: CurrentBookComponent },
      { path: 'statistics', component: StadisticsComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'user', component: UserComponent },
      { path: 'searchAuthor', component: SearchAuthorComponent },
      { path: 'searchBook', component: SearchBookComponent },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
