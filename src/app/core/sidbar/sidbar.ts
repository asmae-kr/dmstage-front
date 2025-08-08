// src/app/core/sidbar/sidbar.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidbar.html',
  styleUrl: './sidbar.css'
})
export class Sidbar implements OnInit {
  userRole: string = '';
  currentUrl: string = '';
  
  // ✅ MODE TEST pour le développement
  private testMode: boolean = true; // Changer à false quand backend connecté
  
  constructor(
    private authService: AuthService,
    public router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.currentUrl = this.router.url;
    
    // ✅ LOGIQUE DE TEST selon l'URL courante
    if (this.testMode) {
      this.setTestRole();
    } else {
      // Mode production avec vraie authentification
      this.userRole = this.authService.getRole();
    }
    
    console.log('DEBUG - Current URL:', this.currentUrl);
    console.log('DEBUG - User role:', this.userRole);
    console.log('DEBUG - Test mode:', this.testMode);
    
    // Écouter les changements de navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.urlAfterRedirects;
        
        // Réévaluer le rôle en mode test
        if (this.testMode) {
          this.setTestRole();
        }
      });
  }

  // ✅ DÉFINIR LE RÔLE SELON LA PAGE COURANTE (MODE TEST)
  private setTestRole(): void {
    if (this.currentUrl.includes('/admin')) {
      this.userRole = 'ADMIN';
    } else if (this.currentUrl.includes('/home') || 
               this.currentUrl.includes('/mes-demandes') || 
               this.currentUrl.includes('/demande-form') ||
               this.currentUrl.includes('/profile')) {
      this.userRole = 'USER';
    } else {
      // Pages publiques (login, register)
      this.userRole = '';
    }
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  // Vérifier si l'utilisateur est un utilisateur standard  
  isUser(): boolean {
    return this.userRole === 'USER';
  }

  // Méthodes pour vérifier l'URL active
  isRouteActive(route: string): boolean {
    return this.currentUrl.includes(route);
  }

  isExactRoute(route: string): boolean {
    return this.currentUrl === route;
  }

  // Navigation vers l'accueil selon le rôle
  goHome() {
    if (this.isAdmin()) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  // Navigation vers les demandes selon le rôle
  goToRequests() {
    if (this.isAdmin()) {
      this.router.navigate(['/admin/demandes']);
    } else {
      this.router.navigate(['/mes-demandes']);
    }
  }

  // Retour à la page précédente
  goBack() {
    this.location.back();
  }

  // Déconnexion
  logout() {
    if (this.testMode) {
      // En mode test, juste rediriger
      console.log('Mode test - Redirection vers login');
      this.router.navigate(['/login']);
    } else {
      // En mode production, vraie déconnexion
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}