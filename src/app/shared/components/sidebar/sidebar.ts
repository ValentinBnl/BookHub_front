import { Component, inject, signal, computed, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IconComponent, type IconName } from '../icon/icon';
import { LoansService } from '../../../features/loans/loans.service';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  count?: number;
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

  readonly loanCount = signal<number | undefined>(undefined);

  readonly navItems = computed<NavItem[]>(() => [
    { label: 'Accueil',      route: '/home',    icon: 'home' },
    { label: 'Catalogue',    route: '/catalog', icon: 'catalog' },
    { label: 'Mes emprunts', route: '/loans',   icon: 'borrow', count: this.loanCount() },
  ]);

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
