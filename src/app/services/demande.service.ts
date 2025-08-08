import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { DemandeStage } from '../models/demande.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer le token JWT stocké (dans localStorage par exemple)
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // ou sessionStorage, selon ton stockage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createDemande(demande: DemandeStage): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/demandes/info`, demande, { headers });
  }

  uploadDocuments(email: string, files: {
    conventionStage: File;
    demandeStage: File;
    cv: File;
    lettreMotivation: File;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('conventionStage', files.conventionStage);
    formData.append('demandeStage', files.demandeStage);
    formData.append('cv', files.cv);
    formData.append('lettreMotivation', files.lettreMotivation);

    const headers = this.getAuthHeaders();
    // Important : Pour FormData, on ne met pas 'Content-Type', le navigateur gère ça
    return this.http.post(`${this.apiUrl}/demandes/upload/${email}`, formData, { headers });
  }

  getMesDemandes(): Observable<DemandeStage[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<DemandeStage[]>(`${this.apiUrl}/user/mes-demandes`, { headers });
  }
}
