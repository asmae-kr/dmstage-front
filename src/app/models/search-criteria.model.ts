// src/app/models/search-criteria.model.ts

export interface SearchCriteria {
  nom?: string;
  prenom?: string;
  sexe?: string;
  email?: string;
  telephone?: string;
  cin?: string;
  adresseDomicile?: string;
  typeStage?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
}

export interface ExportCriteria extends SearchCriteria {
  dateDebutExport?: string;
  dateFinExport?: string;
  format?: 'EXCEL' | 'PDF';
}