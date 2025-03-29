import { Routes } from '@angular/router';
import { LayoutComponent } from './client/layout/layout.component';
import { HomeComponent } from './client/home/home/home.component';
import { LoginComponent } from './client/features/login/login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { LibraryComponent } from './client/library/library/library.component';
import { CurrentBookComponent } from './client/current-book/current-book/current-book.component';
import { StatisticsComponent } from './client/statistics/statistics/statistics.component';
import { QualificationsComponent } from './client/qualifications/qualifications/qualifications.component';
import { WishlistComponent } from './client/wishlist/wishlist/wishlist.component';

import { SettingsComponent } from './client/settings/settings/settings.component';

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
      { path: 'statistics', component: StatisticsComponent },
      { path: 'qualifications', component: QualificationsComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  { path: '**', component: PageNotFoundComponent },
];
