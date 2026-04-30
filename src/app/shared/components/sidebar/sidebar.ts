import { Component, inject, signal, computed, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IconComponent, type IconName } from '../icon/icon';
import { LoansService } from '../../../features/loans/loans.service';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  count?: number;
  roles?: string[];
  notRoles?: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private loansService = inject(LoansService);
  private destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  readonly displayName = this.authService.displayName;
  readonly initials = this.authService.initials;
  readonly memberSinceLabel = this.authService.memberSinceLabel;

  readonly loanCount = signal<number | undefined>(undefined);

  private readonly allNavItems: NavItem[] = [
    { label: 'Accueil',           route: '/home',              icon: 'home' },
    { label: 'Catalogue',         route: '/catalog',           icon: 'catalog',  notRoles: ['LIBRAIRE'] },
    { label: 'Mes emprunts',      route: '/loans',             icon: 'borrow',   notRoles: ['LIBRAIRE'] },
    { label: 'Gestion catalogue', route: '/librarian-catalog', icon: 'book',     roles: ['LIBRAIRE'] },
  ];

  navItems = computed<NavItem[]>(() => {
    const role = this.authService.currentUser()?.role ?? '';
    return this.allNavItems
      .filter(item => !item.roles || item.roles.includes(role))
      .filter(item => !item.notRoles || !item.notRoles.includes(role))
      .map(item => item.route === '/loans' ? { ...item, count: this.loanCount() } : item);
  });

  readonly bottomItems: NavItem[] = [
    { label: 'Paramètres',  route: '/settings', icon: 'settings' },
    { label: 'Déconnexion', route: '/auth',      icon: 'logout' },
  ];

  constructor() {
    afterNextRender(() => {
      this.loansService.getMyLoans()
        .pipe(
          catchError(() => of([])),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(loans => {
          const active = loans.filter(l => l.statut === 'EN COURS' || l.statut === 'EN RETARD');
          this.loanCount.set(active.length || undefined);
        });
    });
  }
}