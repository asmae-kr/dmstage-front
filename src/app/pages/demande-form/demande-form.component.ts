import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatExpansionModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.css']
})

export class DemandeFormComponent {
  dto: any = {};
  files: { [key: string]: File } = {};

  constructor(public authService: AuthService) {}

  submitInfos() {
    console.log('Infos envoyées', this.dto);
  }

  onFileSelected(event: any, type: string) {
    this.files[type] = event.target.files[0];
  }

  submitFiles() {
    console.log('Fichiers sélectionnés :', this.files);
  }
    logout() {
  this.authService.logout();
}

}
