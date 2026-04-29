import { Component, computed, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";
import { IconComponent, type IconName } from "../icon/icon";

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
  count?: number;
  roles?: string[];
}

@Component({
  selector: "app-sidebar",
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly displayName = this.authService.displayName;
  readonly initials = this.authService.initials;
  readonly memberSinceLabel = this.authService.memberSinceLabel;

  private readonly allNavItems: NavItem[] = [
    { label: "Accueil", route: "/home", icon: "home" },
    { label: "Catalogue", route: "/catalog", icon: "catalog" },
    { label: "Mes emprunts", route: "/loans", icon: "borrow", count: 3 },
    {
      label: "Gestion catalogue",
      route: "/librarian-catalog",
      icon: "book",
      roles: ["LIBRAIRE"],
    },
  ];

  navItems = computed(() => {
    const role = this.authService.currentUser()?.role ?? "";
    return this.allNavItems.filter(
      (item) => !item.roles || item.roles.includes(role),
    );
  });

  bottomItems: NavItem[] = [
    { label: "Paramètres", route: "/settings", icon: "settings" },
    { label: "Déconnexion", route: "/auth", icon: "logout" },
  ];
}
