// src/app/pages/admin-demandes/admin-demandes.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DemandeStage } from '../../services/admin.service';
import { PageResponse, PageRequest } from '../../models/pagination.model';
import { SearchCriteria } from '../../models/search-criteria.model';

@Component({
  selector: 'app-admin-demandes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="demandes-container">
      <div class="header">
        <h1>📋 Gestion des Demandes de Stage</h1>
        <div class="stats-quick">
          <span class="stat">Total: {{ pageInfo.totalElements }}</span>
          <span class="stat pending">En attente: {{ getCountByStatus('EN_ATTENTE') }}</span>
          <span class="stat accepted">Acceptées: {{ getCountByStatus('ACCEPTE') }}</span>
          <span class="stat rejected">Refusées: {{ getCountByStatus('REFUSE') }}</span>
        </div>
      </div>

      <!-- Recherche rapide -->
      <div class="search-section">
        <div class="search-simple">
          <input 
            type="text" 
            [(ngModel)]="rechercheSimple"
            placeholder="🔍 Rechercher par nom, prénom ou email..."
            (keyup.enter)="effectuerRechercheSimple()"
            class="search-input">
          <button (click)="effectuerRechercheSimple()" class="btn-search">Rechercher</button>
          <button (click)="toggleRechercheAvancee()" class="btn-toggle">
            {{ showRechercheAvancee ? '🔼 Fermer' : '🔽 Recherche avancée' }}
          </button>
        </div>

        <!-- Recherche avancée -->
        @if (showRechercheAvancee) {
          <div class="search-advanced">
            <div class="search-grid">
              <input type="text" [(ngModel)]="criteres.nom" placeholder="Nom">
              <input type="text" [(ngModel)]="criteres.prenom" placeholder="Prénom">
              <input type="email" [(ngModel)]="criteres.email" placeholder="Email">
              <input type="text" [(ngModel)]="criteres.telephone" placeholder="Téléphone">
              <input type="text" [(ngModel)]="criteres.cin" placeholder="CIN">
              <select [(ngModel)]="criteres.sexe">
                <option value="">Sexe</option>
                <option value="HOMME">Homme</option>
                <option value="FEMME">Femme</option>
              </select>
              <input type="text" [(ngModel)]="criteres.typeStage" placeholder="Type de stage">
              <select [(ngModel)]="criteres.statut">
                <option value="">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="ACCEPTE">Accepté</option>
                <option value="REFUSE">Refusé</option>
              </select>
            </div>
            <div class="search-actions">
              <button (click)="effectuerRechercheAvancee()" class="btn-search">🔍 Rechercher</button>
              <button (click)="reinitialiserRecherche()" class="btn-reset">🔄 Réinitialiser</button>
            </div>
          </div>
        }
      </div>

      <!-- Loading -->
      @if (loading) {
        <div class="loading">⏳ Chargement des demandes...</div>
      }

      <!-- Message d'erreur -->
      @if (errorMessage) {
        <div class="error-message">
          ❌ {{ errorMessage }}
          <button (click)="chargerDemandes()" class="retry-btn">Réessayer</button>
        </div>
      }

      <!-- Message de succès -->
      @if (successMessage) {
        <div class="success-message">✅ {{ successMessage }}</div>
      }

      <!-- Table des demandes -->
      @if (!loading && demandes.length > 0) {
        <div class="table-container">
          <table class="demandes-table">
            <thead>
              <tr>
                <th>Nom & Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Type Stage</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (demande of demandes; track demande.id) {
                <tr class="demande-row">
                  <td>
                    <div class="name-info">
                      <strong>{{ demande.nom }} {{ demande.prenom }}</strong>
                      <small>{{ demande.cin }}</small>
                    </div>
                  </td>
                  <td>{{ demande.email }}</td>
                  <td>{{ demande.telephone }}</td>
                  <td>{{ demande.typeStage }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="demande.statut.toLowerCase()">
                      {{ getStatusLabel(demande.statut) }}
                    </span>
                  </td>
                  <td>{{ formatDate(demande.dateCreation) }}</td>
                  <td class="actions">
                    <select 
                      [value]="demande.statut" 
                      (change)="changerStatut(demande.id!, $event)"
                      class="status-select">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="ACCEPTE">Accepter</option>
                      <option value="REFUSE">Refuser</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-section">
          <div class="pagination-info">
            Affichage {{ pageInfo.numberOfElements }} sur {{ pageInfo.totalElements }} demandes
            (Page {{ pageInfo.number + 1 }} sur {{ pageInfo.totalPages }})
          </div>
          
          <div class="pagination-controls">
            <select [(ngModel)]="pagination.size" (change)="changerTaillePage()" class="page-size">
              <option value="10">10 par page</option>
              <option value="25">25 par page</option>
              <option value="50">50 par page</option>
            </select>
            
            <div class="pagination-nav">
              <button 
                (click)="allerPage(0)" 
                [disabled]="pageInfo.first"
                class="nav-btn">⏮️</button>
              <button 
                (click)="allerPage(pagination.page - 1)" 
                [disabled]="pageInfo.first"
                class="nav-btn">⬅️</button>
              
              <span class="page-current">{{ pagination.page + 1 }}</span>
              
              <button 
                (click)="allerPage(pagination.page + 1)" 
                [disabled]="pageInfo.last"
                class="nav-btn">➡️</button>
              <button 
                (click)="allerPage(pageInfo.totalPages - 1)" 
                [disabled]="pageInfo.last"
                class="nav-btn">⏭️</button>
            </div>
          </div>
        </div>
      }

      <!-- Aucune demande -->
      @if (!loading && demandes.length === 0) {
        <div class="no-data">
          📭 Aucune demande trouvée
          @if (isSearchActive()) {
            <button (click)="reinitialiserRecherche()" class="btn-reset">Voir toutes les demandes</button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .demandes-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header h1 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .stats-quick {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      background: #f8f9fa;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .stat.pending { background: #fff3cd; color: #856404; }
    .stat.accepted { background: #d4edda; color: #155724; }
    .stat.rejected { background: #f8d7da; color: #721c24; }

    .search-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }

    .search-simple {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 1rem;
    }

    .btn-search, .btn-toggle, .btn-reset {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-search { background: #007bff; color: white; }
    .btn-search:hover { background: #0056b3; }

    .btn-toggle { background: #6c757d; color: white; }
    .btn-toggle:hover { background: #545b62; }

    .btn-reset { background: #28a745; color: white; }
    .btn-reset:hover { background: #218838; }

    .search-advanced {
      border-top: 1px solid #eee;
      padding-top: 1rem;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .search-grid input, .search-grid select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 3px;
    }

    .search-actions {
      display: flex;
      gap: 1rem;
    }

    .loading, .error-message, .success-message, .no-data {
      text-align: center;
      padding: 2rem;
      margin: 1rem 0;
      border-radius: 5px;
    }

    .loading {
      background: #e3f2fd;
      color: #1565c0;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .success-message {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .no-data {
      background: #f8f9fa;
      color: #6c757d;
    }

    .retry-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 3px;
      cursor: pointer;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }

    .demandes-table {
      width: 100%;
      border-collapse: collapse;
    }

    .demandes-table th {
      background: #f8f9fa;
      color: #495057;
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
    }

    .demandes-table td {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .demande-row:hover {
      background: #f8f9fa;
    }

    .name-info strong {
      display: block;
      color: #2c3e50;
    }

    .name-info small {
      color: #6c757d;
      font-size: 0.8rem;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.en_attente {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.accepte {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.refuse {
      background: #f8d7da;
      color: #721c24;
    }

    .status-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 3px;
      background: white;
      cursor: pointer;
    }

    .pagination-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .pagination-info {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-size {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 3px;
    }

    .pagination-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-btn {
      padding: 0.5rem;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 3px;
      transition: background 0.3s;
    }

    .nav-btn:hover:not(:disabled) {
      background: #f8f9fa;
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-current {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border-radius: 3px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .demandes-container {
        padding: 1rem;
      }
      
      .search-simple {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-quick {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .table-container {
        overflow-x: auto;
      }
      
      .pagination-section {
        flex-direction: column;
        gap: 1rem;
      }
      
      .pagination-controls {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class AdminDemandesComponent implements OnInit {
  
  // ✅ Propriétés corrigées
  demandes: DemandeStage[] = [];
  pageInfo: PageResponse<DemandeStage> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
    pageable: {
      sort: { sorted: false, unsorted: true, empty: true },
      pageNumber: 0,
      pageSize: 10,
      offset: 0,
      paged: true,
      unpaged: false
    },
    sort: { sorted: false, unsorted: true, empty: true }
  };
  
  pagination: PageRequest = {
    page: 0,
    size: 10,
    sort: ['dateCreation,desc']
  };
  
  criteres: SearchCriteria = {};
  rechercheSimple = '';
  showRechercheAvancee = false;
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.chargerDemandes();
  }

  // ✅ Charger demandes corrigé
  chargerDemandes() {
    this.loading = true;
    this.errorMessage = '';
    
    this.adminService.getAllDemandes(this.pagination).subscribe({
      next: (response: PageResponse<DemandeStage>) => {
        this.pageInfo = response;
        this.demandes = response.content || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message;
        this.loading = false;
        this.demandes = [];
      }
    });
  }

  changerStatut(id: number, event: any) {
    const nouveauStatut = event.target.value;
    
    this.adminService.changerStatut(id, nouveauStatut).subscribe({
      next: () => {
        this.successMessage = 'Statut mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
        this.chargerDemandes(); // Recharger pour voir les changements
      },
      error: (error: any) => {
        this.errorMessage = `Erreur lors du changement de statut : ${error.message}`;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  effectuerRechercheSimple() {
    if (this.rechercheSimple.trim()) {
      this.criteres = {
        nom: this.rechercheSimple,
        prenom: this.rechercheSimple,
        email: this.rechercheSimple
      };
      this.effectuerRecherche();
    } else {
      this.reinitialiserRecherche();
    }
  }

  effectuerRechercheAvancee() {
    this.effectuerRecherche();
  }

  effectuerRecherche() {
    this.pagination.page = 0; // Reset à la première page
    this.loading = true;
    
    this.adminService.rechercherDemandes(this.criteres, this.pagination).subscribe({
      next: (response: PageResponse<DemandeStage>) => {
        this.pageInfo = response;
        this.demandes = response.content || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message;
        this.loading = false;
        this.demandes = [];
      }
    });
  }

  reinitialiserRecherche() {
    this.criteres = {};
    this.rechercheSimple = '';
    this.pagination.page = 0;
    this.chargerDemandes();
  }

  toggleRechercheAvancee() {
    this.showRechercheAvancee = !this.showRechercheAvancee;
  }

  isSearchActive(): boolean {
    return this.rechercheSimple.trim() !== '' || 
           Object.keys(this.criteres).some(key => this.criteres[key as keyof SearchCriteria]);
  }

  changerTaillePage() {
    this.pagination.page = 0;
    this.chargerDemandes();
  }

  allerPage(page: number) {
    this.pagination.page = page;
    this.chargerDemandes();
  }

  getCountByStatus(statut: string): number {
    return this.demandes.filter(d => d.statut === statut).length;
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ACCEPTE': return 'Accepté';
      case 'REFUSE': return 'Refusé';
      default: return statut;
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Utilitaire pour le template
  Math = Math;
}