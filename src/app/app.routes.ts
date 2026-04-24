import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/dashboard/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/books/pages/catalog/catalog').then((m) => m.Catalog),
      },
      {
        path: 'loans',
        loadComponent: () =>
          import('./features/loans/pages/my-loans/my-loans').then((m) => m.MyLoans),
      },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
