import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout';

export const routes: Routes = [
  // ROUTES AUTH (login / register)
  {
    path: 'auth',
    loadComponent: () =>
        import('./shared/layout/auth-layout/auth-layout')
            .then((m) => m.AuthLayout),
    children: [
      {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login')
                .then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/pages/register/register')
                .then((m) => m.Register),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // ROUTES APP (avec layout principal)
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
      {
        path: 'book/:id',
        loadComponent: () =>
          import('./features/books/pages/book-detail/book-detail').then((m) => m.BookDetail),
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: 'home' },
];
