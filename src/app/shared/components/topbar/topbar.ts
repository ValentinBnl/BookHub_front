import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-topbar',
  imports: [IconComponent],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class TopbarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly initials = this.authService.initials;

  search(event: Event) {
    const q = (event.target as HTMLInputElement).value.trim();
    this.router.navigate(['/catalog'], { queryParams: q ? { q } : {} });
  }
}
