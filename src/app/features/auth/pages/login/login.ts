import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email    = '';
  password = '';
  remember = false;

  onSubmit() {
    console.log({ email: this.email, password: this.password, remember: this.remember });
  }
}
