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

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  // ✅ Test de connexion admin (nom corrigé)
  testerConnexion(): Observable<any> {
    return this.http.get(`${ADMIN_ENDPOINTS.TEST}`)
      .pipe(catchError(this.handleError));
  }

  // Dashboard - Récupérer les statistiques
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

  // ✅ Récupérer toutes les demandes avec pagination (méthode simplifiée)
  getAllDemandes(request?: PageRequest): Observable<PageResponse<DemandeStage>> {
    const defaultRequest: PageRequest = {
      page: request?.page || 0,
      size: request?.size || 10,
      sort: request?.sort
    };

    let params = new HttpParams()
      .set('page', defaultRequest.page.toString())
      .set('size', defaultRequest.size.toString());

    if (defaultRequest.sort && defaultRequest.sort.length > 0) {
      defaultRequest.sort.forEach(sortParam => {
        params = params.append('sort', sortParam);
      });
    }

    return this.http.get<PageResponse<DemandeStage>>(ADMIN_ENDPOINTS.DEMANDES, { params })
      .pipe(catchError(this.handleError));
  }

  // Changer le statut d'une demande
  changerStatut(id: number, nouveauStatut: string): Observable<any> {
    const body = { statut: nouveauStatut };
    return this.http.put(ADMIN_ENDPOINTS.DEMANDE_STATUT(id), body)
      .pipe(catchError(this.handleError));
  }

  // Rechercher des demandes avec critères
  rechercherDemandes(criteria: SearchCriteria, request: PageRequest): Observable<PageResponse<DemandeStage>> {
    let params = new HttpParams()
      .set('page', request.page.toString())
      .set('size', request.size.toString());

    // Ajouter les critères de recherche
    if (criteria.nom) params = params.append('nom', criteria.nom);
    if (criteria.prenom) params = params.append('prenom', criteria.prenom);
    if (criteria.email) params = params.append('email', criteria.email);
    if (criteria.telephone) params = params.append('telephone', criteria.telephone);
    if (criteria.cin) params = params.append('cin', criteria.cin);
    if (criteria.sexe) params = params.append('sexe', criteria.sexe);
    if (criteria.adresseDomicile) params = params.append('adresseDomicile', criteria.adresseDomicile);
    if (criteria.typeStage) params = params.append('typeStage', criteria.typeStage);
    if (criteria.statut) params = params.append('statut', criteria.statut);
    if (criteria.dateDebut) params = params.append('dateDebut', criteria.dateDebut);
    if (criteria.dateFin) params = params.append('dateFin', criteria.dateFin);

    return this.http.get<PageResponse<DemandeStage>>(ADMIN_ENDPOINTS.RECHERCHE, { params })
      .pipe(catchError(this.handleError));
  }

  // Exporter les demandes en Excel
  exporterDemandes(criteria: ExportCriteria): Observable<Blob> {
    let params = new HttpParams();

    // Ajouter les critères d'export
    if (criteria.nom) params = params.append('nom', criteria.nom);
    if (criteria.prenom) params = params.append('prenom', criteria.prenom);
    if (criteria.email) params = params.append('email', criteria.email);
    if (criteria.statut) params = params.append('statut', criteria.statut);
    if (criteria.typeStage) params = params.append('typeStage', criteria.typeStage);
    if (criteria.dateDebutExport) params = params.append('dateDebut', criteria.dateDebutExport);
    if (criteria.dateFinExport) params = params.append('dateFin', criteria.dateFinExport);
    if (criteria.format) params = params.append('format', criteria.format);

    return this.http.get(ADMIN_ENDPOINTS.EXPORT, {
      params,
      responseType: 'blob'
    }).pipe(catchError(this.handleError));
  }

  // ✅ Gestion des erreurs avec types
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
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
        default:
          errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Erreur AdminService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

// ✅ Export de DemandeStage pour les composants
export type { DemandeStage };