import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent, type IconName } from '../icon/icon';

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
  navItems: NavItem[] = [
    { label: 'Accueil',      route: '/home',    icon: 'home' },
    { label: 'Catalogue',    route: '/catalog', icon: 'catalog' },
    { label: 'Mes emprunts', route: '/loans',   icon: 'borrow', count: 3 },
  ];

  bottomItems: NavItem[] = [
    { label: 'Paramètres',  route: '/settings', icon: 'settings' },
    { label: 'Déconnexion', route: '/auth',      icon: 'logout' },
  ];
}
