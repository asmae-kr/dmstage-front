import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // ✅ PAS HttpClientModule ici
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
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/mes-demandes']);
        }
      },
      error: () => {
        this.errorMsg = 'Email ou mot de passe invalide';
      }
    });
  }
}
