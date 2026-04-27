import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [FormsModule], // 👈 OBLIGATOIRE pour ngModel
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  email: string = '';
  password: string = '';

  onSubmit() {
    console.log(this.email, this.password);
  }
}