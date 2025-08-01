import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { DemandeStage } from '../models/demande.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createDemande(demande: DemandeStage): Observable<any> {
    return this.http.post(`${this.apiUrl}/demandes/info`, demande);
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
    return this.http.post(`${this.apiUrl}/demandes/upload/${email}`, formData);
  }

  getMesDemandes(): Observable<DemandeStage[]> {
    return this.http.get<DemandeStage[]>(`${this.apiUrl}/user/mes-demandes`);
  }
}
