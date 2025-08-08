import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Pas besoin de HttpClientModule ici
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  motDePasse = '';
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login({ email: this.email, motDePasse: this.motDePasse }).subscribe({
      next: () => {
        const role = this.authService.getRole();
        console.log('Rôle récupéré après connexion :', role);
        if (role === 'ADMIN') {
          console.log('Navigation vers admin-dashboard');
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la connexion :', err);
        this.errorMsg = 'Email ou mot de passe invalide';
      }
    });
  }
}
