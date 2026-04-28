import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  nom = '';
  prenom = '';
  email = '';
  telephone = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.nom || !this.prenom || !this.email || !this.telephone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (!this.isStrongPassword(this.password)) {
      this.errorMessage = 'Le mot de passe doit contenir 12 caracteres minimum, avec majuscule, minuscule, chiffre et caractere special.';
      return;
    }

    this.loading = true;

    this.authService
      .register({
        nom: this.nom,
        prenom: this.prenom,
        email: this.email,
        telephone: this.telephone,
        motDePasse: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.authService.logout();
          void this.router.navigate(['/auth/login'], { queryParams: { registered: '1' } });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;

          if (error.status === 0) {
            this.errorMessage = 'Backend inaccessible. Verifie que l API tourne.';
            return;
          }

          const backendMessage = typeof error.error?.message === 'string' ? error.error.message : '';
          if (backendMessage) {
            this.errorMessage = backendMessage;
            return;
          }

          if (error.status === 400) {
            this.errorMessage = 'Les informations saisies sont invalides.';
            return;
          }

          this.errorMessage = 'Une erreur est survenue lors de la creation du compte.';
        },
      });
  }

  private isStrongPassword(value: string): boolean {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(value);
  }
}
