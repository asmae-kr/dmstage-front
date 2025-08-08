import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model'; // Assure-toi que ce modèle existe

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user?: User;
  errorMsg = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (data: User) => this.user = data,
      error: () => this.errorMsg = "Erreur lors du chargement du profil"
    });
  }
}
