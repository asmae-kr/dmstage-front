import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { User } from '../models/user.model';  // Assure-toi que ce modèle existe et correspond à ta réponse backend

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; motDePasse: string }): Observable<void> {
  return this.http
    .post<{ id: number; email: string; role: string; token: string }>(
      `${this.apiUrl}/login`,
      credentials
    )
    .pipe(
      tap(res => {
        console.log('Réponse login:', res);
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('user_role', res.role);
      }),
      map(() => void 0)
    );
}


  register(userData: { nom: string; email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/profile`);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getRole(): string {
    return localStorage.getItem('user_role') ?? '';
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
