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
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  dateCreation?: string;
  dateModification?: string;
}