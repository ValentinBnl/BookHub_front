import { inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CanActivateFn, Router } from "@angular/router";

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) return true;
    const role = localStorage.getItem("role");
    if (role && allowedRoles.includes(role)) return true;
    return router.createUrlTree(["/home"]);
  };
}
