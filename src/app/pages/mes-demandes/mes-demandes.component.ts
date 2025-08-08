import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DemandeService } from '../../services/demande.service';
import { DemandeStage } from '../../models/demande.model';

@Component({
  selector: 'app-mes-demandes',
  standalone: true,
  imports: [
    CommonModule,       // ✅ Pour *ngIf, *ngFor, ngClass, etc.
    HttpClientModule,
    RouterModule,
    DatePipe             // ✅ Pour le pipe date
  ],
  templateUrl: './mes-demandes.component.html',
  styleUrls: ['./mes-demandes.component.css']
})
export class MesDemandesComponent implements OnInit {

  demandes: DemandeStage[] = [];
  loading = false;
  errorMessage = '';

  
constructor(
  public authService: AuthService,
  public demandeService: DemandeService,
) {}

  ngOnInit() {
    this.getMesDemandes();
  }

  getMesDemandes() {
    this.loading = true;
    this.errorMessage = '';

    this.demandeService.getMesDemandes().subscribe({
      next: (data) => {
        this.demandes = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du chargement des demandes.';
        this.loading = false;
      }
    });
  }

  getStatutClass(statut: string): string {
  switch (statut) {
    case 'ACCEPTEE': return 'statut-acceptee';
    case 'REFUSEE': return 'statut-refusee';
    default: return 'statut-attente';
  }
}

  logout() {
  this.authService.logout();
}

}
