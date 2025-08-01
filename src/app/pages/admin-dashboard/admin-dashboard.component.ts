// src/app/pages/admin-dashboard/admin-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, DashboardStats } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>🎯 Dashboard Administrateur</h1>
        <p>Gérez et suivez toutes les demandes de stage</p>
      </div>

      <!-- Message de test connexion -->
      <div class="test-section">
        <button (click)="testerConnexion()" class="btn-test" [disabled]="loading">
          {{ loading ? '⏳ Test en cours...' : '🔍 Tester la connexion Admin' }}
        </button>
        
        @if (connexionMessage) {
          <div class="message" [ngClass]="connexionOk ? 'success' : 'error'">
            {{ connexionMessage }}
          </div>
        }
      </div>

      <!-- Statistiques -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.totalDemandes }}</div>
          <div class="stat-label">Total Demandes</div>
        </div>
        
        <div class="stat-card pending">
          <div class="stat-number">{{ stats.demandesEnAttente }}</div>
          <div class="stat-label">En Attente</div>
        </div>
        
        <div class="stat-card accepted">
          <div class="stat-number">{{ stats.demandesAcceptees }}</div>
          <div class="stat-label">Acceptées</div>
        </div>
        
        <div class="stat-card rejected">
          <div class="stat-number">{{ stats.demandesRefusees }}</div>
          <div class="stat-label">Refusées</div>
        </div>

        <div class="stat-card today">
          <div class="stat-number">{{ stats.demandesAujourdhui }}</div>
          <div class="stat-label">Aujourd'hui</div>
        </div>

        <div class="stat-card week">
          <div class="stat-number">{{ stats.demandesCetteSemaine }}</div>
          <div class="stat-label">Cette Semaine</div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="actions-section">
        <h2>🚀 Actions rapides</h2>
        <div class="actions-grid">
          <button (click)="voirDemandes()" class="action-btn primary">
            📋 Voir toutes les demandes
          </button>
          <button (click)="actualiserStats()" class="action-btn secondary" [disabled]="loading">
            🔄 Actualiser les statistiques
          </button>
        </div>
      </div>

      <!-- Message d'erreur -->
      @if (errorMessage) {
        <div class="error-message">
          ❌ {{ errorMessage }}
          <button (click)="actualiserStats()" class="retry-btn">Réessayer</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-header h1 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .test-section {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      text-align: center;
    }

    .btn-test {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .btn-test:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-test:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .message {
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 5px;
    }

    .message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      border-left: 4px solid #007bff;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card.pending { border-left-color: #ffc107; }
    .stat-card.accepted { border-left-color: #28a745; }
    .stat-card.rejected { border-left-color: #dc3545; }
    .stat-card.today { border-left-color: #17a2b8; }
    .stat-card.week { border-left-color: #6f42c1; }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .actions-section h2 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.3s;
    }

    .action-btn.primary {
      background: #28a745;
      color: white;
    }

    .action-btn.primary:hover {
      background: #218838;
    }

    .action-btn.secondary {
      background: #6c757d;
      color: white;
    }

    .action-btn.secondary:hover:not(:disabled) {
      background: #545b62;
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .retry-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 3px;
      cursor: pointer;
    }

    .retry-btn:hover {
      background: #c82333;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  
  stats: DashboardStats = {
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesAcceptees: 0,
    demandesRefusees: 0,
    demandesAujourdhui: 0,
    demandesCetteSemaine: 0,
    message: 'Chargement...'
  };
  
  loading = false;
  errorMessage = '';
  connexionMessage = '';
  connexionOk = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.chargerStats();
  }

  // ✅ Test connexion admin (nom corrigé)
  testerConnexion() {
    this.loading = true;
    this.connexionMessage = '';
    
    this.adminService.testerConnexion().subscribe({
      next: (result: any) => {
        this.connexionMessage = '✅ Connexion admin réussie !';
        this.connexionOk = true;
        this.loading = false;
      },
      error: (error: any) => {
        this.connexionMessage = `❌ Échec connexion : ${error.message}`;
        this.connexionOk = false;
        this.loading = false;
      }
    });
  }

  chargerStats() {
    this.loading = true;
    this.errorMessage = '';
    
    this.adminService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }

  actualiserStats() {
    this.chargerStats();
  }

  voirDemandes() {
    // Logique pour naviguer vers la page des demandes
    console.log('Navigation vers les demandes...');
  }
}