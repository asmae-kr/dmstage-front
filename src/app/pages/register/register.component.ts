import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nom = '';
  email = '';
  motDePasse = '';
  erreur = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const user = {
      nom: this.nom,
      email: this.email,
      motDePasse: this.motDePasse
    };

    this.authService.register(user).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.erreur = "Erreur lors de l'inscription";
      }
    });
  }
}
