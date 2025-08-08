export interface DemandeStage {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cin: string;
  sexe: string;
  adresseDomicile: string;
  typeStage: string;
  dateDebut: string;
  dateFin: string;
  dateDemande: Date | string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';  // ✅ Changé ici
  dateCreation?: string;
  dateModification?: string;
  commentaire?: string;  // ✅ Ajouté
  cvFileName: string;   // ✅ Ajouté
}

// Si vous avez d'autres types liés, modifiez-les aussi
export type StatutDemande = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

// Interface pour les réponses API si nécessaire
export interface DemandeResponse {
  content: DemandeStage[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}