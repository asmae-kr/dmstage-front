// src/app/services/admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Import des models
import { PageResponse, PageRequest } from '../models/pagination.model';
import { SearchCriteria, ExportCriteria } from '../models/search-criteria.model';
import { DemandeStage } from '../models/demande.model';

// Configuration API
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
};

const ADMIN_ENDPOINTS = {
  DASHBOARD: `${API_CONFIG.BASE_URL}/admin/dashboard`,
  TEST: `${API_CONFIG.BASE_URL}/admin/test`,
  DEMANDES: `${API_CONFIG.BASE_URL}/admin/demandes`,
  DEMANDE_STATUT: (id: number) => `${API_CONFIG.BASE_URL}/admin/demandes/${id}/statut`,
  RECHERCHE: `${API_CONFIG.BASE_URL}/admin/demandes/recherche`,
  EXPORT: `${API_CONFIG.BASE_URL}/admin/demandes/export`,
};

// Interface pour les statistiques du dashboard
export interface DashboardStats {
  totalDemandes: number;
  demandesEnAttente: number;
  demandesAcceptees: number;
  demandesRefusees: number;
  demandesAujourdhui: number;
  demandesCetteSemaine: number;
  message: string;
}

// Interface pour la réponse de changement de statut
export interface StatutChangeResponse {
  success: boolean;
  message: string;
  demandeId: number;
  nouveauStatut: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  // ===== MÉTHODES DE BASE =====

  /**
   * Test de connexion admin
   */
  testerConnexion(): Observable<any> {
    return this.http.get(`${ADMIN_ENDPOINTS.TEST}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Dashboard - Récupérer les statistiques
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<any>(ADMIN_ENDPOINTS.DASHBOARD)
      .pipe(
        map((response: any) => ({
          totalDemandes: 0,
          demandesEnAttente: 0,
          demandesAcceptees: 0,
          demandesRefusees: 0,
          demandesAujourdhui: 0,
          demandesCetteSemaine: 0,
          message: response?.message || 'Dashboard chargé'
        })),
        catchError(this.handleError)
      );
  }

  // ===== GESTION DES DEMANDES =====

  /**
   * Récupérer toutes les demandes avec pagination
   */
  getAllDemandes(request?: PageRequest): Observable<PageResponse<DemandeStage>> {
    let params = new HttpParams();
    
    if (request) {
      params = params.set('page', request.page.toString());
      params = params.set('size', request.size.toString());
      
      if (request.sort && request.sort.length > 0) {
        // Pour les arrays, utiliser append() au lieu de set()
        request.sort.forEach(sortItem => {
          params = params.append('sort', sortItem);
        });
      }
    }

    return this.http.get<PageResponse<DemandeStage>>(ADMIN_ENDPOINTS.DEMANDES, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * NOUVELLE MÉTHODE : Changer le statut d'une demande
   */
  changerStatutDemande(demandeId: number, nouveauStatut: string): Observable<StatutChangeResponse> {
    const url = ADMIN_ENDPOINTS.DEMANDE_STATUT(demandeId);
    
    // Corps de la requête avec le nouveau statut
    const body = {
      statut: nouveauStatut
    };

    console.log(`🔄 Changement de statut pour la demande #${demandeId}: ${nouveauStatut}`);

    return this.http.put<any>(url, body)
      .pipe(
        map((response: any) => ({
          success: true,
          message: response?.message || 'Statut mis à jour avec succès',
          demandeId: demandeId,
          nouveauStatut: nouveauStatut
        } as StatutChangeResponse)),
        catchError((error) => {
          console.error(`❌ Erreur lors du changement de statut pour la demande #${demandeId}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Rechercher des demandes avec critères
   */
  rechercherDemandes(criteria: SearchCriteria, request?: PageRequest): Observable<PageResponse<DemandeStage>> {
    let params = new HttpParams();
    
    // Critères de recherche
    if (criteria.nom) {
      params = params.set('nom', criteria.nom);
    }
    if (criteria.prenom) {
      params = params.set('prenom', criteria.prenom);
    }
    if (criteria.email) {
      params = params.set('email', criteria.email);
    }
    if (criteria.typeStage) {
      params = params.set('typeStage', criteria.typeStage);
    }
    if (criteria.statut) {
      params = params.set('statut', criteria.statut);
    }
    if (criteria.dateDebut) {
      params = params.set('dateDebut', criteria.dateDebut);
    }
    if (criteria.dateFin) {
      params = params.set('dateFin', criteria.dateFin);
    }
    
    // Pagination
    if (request) {
      params = params.set('page', request.page.toString());
      params = params.set('size', request.size.toString());
      
      if (request.sort && request.sort.length > 0) {
        // Pour les arrays, utiliser append() au lieu de set()
        request.sort.forEach(sortItem => {
          params = params.append('sort', sortItem);
        });
      }
    }

    return this.http.get<PageResponse<DemandeStage>>(ADMIN_ENDPOINTS.RECHERCHE, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Exporter les demandes vers Excel
   */
  exporterDemandes(criteria?: ExportCriteria): Observable<Blob> {
    let params = new HttpParams();
    
    if (criteria) {
      if (criteria.format) {
        params = params.set('format', criteria.format);
      }
      if (criteria.dateDebut) {
        params = params.set('dateDebut', criteria.dateDebut);
      }
      if (criteria.dateFin) {
        params = params.set('dateFin', criteria.dateFin);
      }
      if (criteria.statut) {
        params = params.set('statut', criteria.statut);
      }
    }

    return this.http.get(ADMIN_ENDPOINTS.EXPORT, {
      params,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  /**
   * Récupérer une demande spécifique par ID
   */
  getDemandeById(id: number): Observable<DemandeStage> {
    return this.http.get<DemandeStage>(`${ADMIN_ENDPOINTS.DEMANDES}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**

  /**
   * Récupérer les statistiques des demandes
   */
  getStatistiquesDemandes(): Observable<any> {
    return this.http.get(`${ADMIN_ENDPOINTS.DEMANDES}/statistiques`)
      .pipe(catchError(this.handleError));
  }

  // ===== MÉTHODES UTILITAIRES =====

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 400:
          errorMessage = 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit - Droits insuffisants';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        case 0:
          errorMessage = 'Impossible de contacter le serveur';
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error?.message || error.message}`;
      }

      console.error('Erreur HTTP:', {
        status: error.status,
        statusText: error.statusText,
        error: error.error,
        url: error.url
      });
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Valider le format des dates
   */
  private validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  }

  /**
   * Formater une date pour l'API
   */
  formatDateForApi(date: Date | string): string {
    if (typeof date === 'string') {
      return date;
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Vérifier si l'utilisateur a les droits admin
   */
  checkAdminRights(): Observable<boolean> {
    return this.testerConnexion()
      .pipe(
        map(() => true),
        catchError(() => throwError(() => new Error('Droits administrateur requis')))
      );
  }

  // ===== MÉTHODES SPÉCIFIQUES POUR LE DROPDOWN DE STATUT =====

  /**
   * Récupérer les statuts disponibles
   */
  getStatutsDisponibles(): Array<{value: string, label: string, color: string}> {
    return [
      { value: 'EN_ATTENTE', label: 'En attente', color: '#ffa500' },
      { value: 'ACCEPTEE', label: 'Acceptée', color: '#28a745' },
      { value: 'REFUSEE', label: 'Refusée', color: '#dc3545' }
    ];
  }

  /**
   * Valider un changement de statut
   */
  validateStatutChange(ancienStatut: string, nouveauStatut: string): boolean {
    const statutsValides = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE'];
    
    // Vérifier que les statuts sont valides
    if (!statutsValides.includes(ancienStatut) || !statutsValides.includes(nouveauStatut)) {
      return false;
    }
    
    // Vérifier que le statut change réellement
    if (ancienStatut === nouveauStatut) {
      return false;
    }
    
    // Toutes les transitions sont autorisées pour un admin
    return true;
  }

  /**
   * Obtenir le libellé d'un statut
   */
  getStatutLabel(statut: string): string {
    const statutsMap: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'ACCEPTEE': 'Acceptée',
      'REFUSEE': 'Refusée'
    };
    
    return statutsMap[statut] || statut;
  }

  /**
   * Obtenir la couleur d'un statut
   */
  getStatutColor(statut: string): string {
    const couleurs: { [key: string]: string } = {
      'EN_ATTENTE': '#ffa500',
      'ACCEPTEE': '#28a745',
      'REFUSEE': '#dc3545'
    };
    
    return couleurs[statut] || '#6c757d';
  }
}