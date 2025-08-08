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
  prenom = '';
  nom = '';
  email = '';
  motDePasse = '';
  confirmerMotDePasse = '';
  erreur = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.erreur = '';
    this.successMsg = '';

    if (!this.prenom || !this.nom || !this.email || !this.motDePasse || !this.confirmerMotDePasse) {
      this.erreur = 'Veuillez remplir tous les champs';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.erreur = 'Veuillez saisir un email valide';
      return;
    }

    if (this.motDePasse.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.motDePasse !== this.confirmerMotDePasse) {
      this.erreur = 'Les mots de passe ne correspondent pas';
      return;
    }

    const user = {
      nom: `${this.prenom} ${this.nom}`,
      email: this.email,
      motDePasse: this.motDePasse
    };

    this.authService.register(user).subscribe({
      next: () => {
        this.successMsg = 'Inscription réussie ! Redirection vers la connexion...';
        this.erreur = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error: any) => {
        if (error.status === 400) {
          this.erreur = error.error.message || 'Cet email est déjà utilisé';
        } else {
          this.erreur = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
        this.successMsg = '';
      }
    });
  }
}
