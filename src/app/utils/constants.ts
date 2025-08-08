// src/app/utils/constants.ts

// Configuration API Backend
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
};

// Endpoints API - Admin (votre spécialité)
export const ADMIN_ENDPOINTS = {
  DASHBOARD: `${API_CONFIG.BASE_URL}/admin/dashboard`,
  TEST: `${API_CONFIG.BASE_URL}/admin/test`,
  DEMANDES: `${API_CONFIG.BASE_URL}/admin/demandes`,
  DEMANDE_STATUT: (id: number) => `${API_CONFIG.BASE_URL}/admin/demandes/${id}/statut`,
  RECHERCHE: `${API_CONFIG.BASE_URL}/admin/demandes/recherche`,
  EXPORT: `${API_CONFIG.BASE_URL}/admin/demandes/export`,
};

// Statuts des demandes
export const STATUTS_DEMANDE = {
  EN_ATTENTE: 'EN_ATTENTE',
  ACCEPTE: 'ACCEPTE',
  REFUSE: 'REFUSE',
} as const;

// Labels des statuts
export const STATUTS_LABELS = {
  [STATUTS_DEMANDE.EN_ATTENTE]: 'En attente',
  [STATUTS_DEMANDE.ACCEPTE]: 'Acceptée',
  [STATUTS_DEMANDE.REFUSE]: 'Refusée',
};

// Couleurs des statuts
export const STATUTS_COLORS = {
  [STATUTS_DEMANDE.EN_ATTENTE]: '#ffa500',
  [STATUTS_DEMANDE.ACCEPTE]: '#28a745',
  [STATUTS_DEMANDE.REFUSE]: '#dc3545',
};

// Configuration pagination
export const PAGINATION_DEFAUT = {
  PAGE: 0,
  SIZE: 10,
  SIZES: [5, 10, 25, 50, 100],
};

// Messages
export const MESSAGES = {
  ERREUR_GENERIQUE: 'Une erreur est survenue. Veuillez réessayer.',
  ERREUR_RESEAU: 'Erreur de connexion au serveur.',
  ERREUR_AUTHENTIFICATION: 'Email ou mot de passe incorrect.',
  ERREUR_AUTORISATION: 'Vous n\'avez pas les droits nécessaires.',
  SUCCES_STATUT_CHANGE: 'Statut mis à jour avec succès !',
  SUCCES_EXPORT: 'Export réalisé avec succès !',
};