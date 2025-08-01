import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment.development';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`);
  }

  login(credentials: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('user');
    }
    return false; // Côté serveur, considérer comme non connecté
  }

  getCurrentUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    }
    return null; // Côté serveur, retourner null
  }

  getEmail(): string {
    const user = this.getCurrentUser();
    return user?.email ?? '';
  }

  getRole(): string {
    const user = this.getCurrentUser();
    return user?.role ?? '';
  }

  // Méthode utilitaire pour sauvegarder les données utilisateur
  saveUserData(userData: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }
}