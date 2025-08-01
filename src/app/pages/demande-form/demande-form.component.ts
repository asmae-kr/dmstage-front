// src/app/pages/demande-form/demande-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DemandeService } from '../../services/demande.service';
import { DemandeStage } from '../../models/demande.model';

@Component({
  selector: 'app-demande-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './demande-form.component.html',
  styleUrls: ['./demande-form.component.css']
})
export class DemandeFormComponent implements OnInit {

  // ===== DONNÉES DU FORMULAIRE =====
  demande: DemandeStage = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    cin: '',
    sexe: '',
    adresseDomicile: '',
    typeStage: '',
    dateDebut: '',
    dateFin: '',
    statut: 'EN_ATTENTE'
  };

  // Champs additionnels pour le formulaire
  diplome = '';
  profil = '';
  specialite = '';
  duree = '';

  // ===== ÉTAT DU COMPOSANT =====
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  // Fichiers pour l'upload
  selectedFiles: {
    conventionStage?: File;
    demandeStage?: File;
    cv?: File;
    lettreMotivation?: File;
  } = {};

  // ===== OPTIONS DES LISTES =====
  diplomes = [
    'Baccalauréat',
    'DUT',
    'BTS', 
    'Licence',
    'Master',
    'Doctorat',
    'Autre'
  ];

  typesStage = [
    'Stage d\'initiation',
    'Stage d\'application', 
    'Stage de fin d\'études',
    'Stage d\'observation',
    'Stage de perfectionnement'
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private demandeService: DemandeService
  ) {}

  ngOnInit() {
    // Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Pré-remplir avec les données utilisateur si disponibles
    this.preremplirFormulaire();
  }

  // ===== MÉTHODES PRINCIPALES =====

  /**
   * Pré-remplir le formulaire avec les données utilisateur
   */
  preremplirFormulaire() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.demande.email = user.email || '';
      this.demande.nom = user.nom || '';
    }
  }

  /**
   * Soumettre le formulaire avec gestion des fichiers
   */
  onSubmit(form: NgForm) {
    if (!form.valid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.scrollToTop();
      return;
    }

    // Vérifier que tous les fichiers requis sont présents
    if (!this.areAllFilesSelected()) {
      this.errorMessage = 'Veuillez sélectionner tous les documents requis : Convention de stage, Demande de stage, CV, et Lettre de motivation.';
      this.scrollToTop();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // 1. Créer la demande d'abord
    const demandeComplete = this.preparerDonnees();
    
    this.demandeService.createDemande(demandeComplete).subscribe({
      next: (response) => {
        console.log('✅ Demande créée avec succès:', response);
        
        // 2. Ensuite uploader les fichiers
        this.uploadDocuments();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la demande:', error);
        this.errorMessage = error.error?.message || error.message || 'Erreur lors de la création de votre demande. Veuillez réessayer.';
        this.loading = false;
        this.scrollToTop();
      }
    });
  }

  /**
   * Préparer les données pour l'envoi
   */
  preparerDonnees(): DemandeStage {
    return {
      ...this.demande,
      // Assurer que les champs obligatoires sont bien remplis
      typeStage: this.demande.typeStage,
      statut: 'EN_ATTENTE'
    };
  }

  /**
   * Upload des documents
   */
  private uploadDocuments() {
    if (!this.areAllFilesSelected()) {
      this.finishSubmissionWithoutFiles();
      return;
    }

    const files = {
      conventionStage: this.selectedFiles.conventionStage!,
      demandeStage: this.selectedFiles.demandeStage!,
      cv: this.selectedFiles.cv!,
      lettreMotivation: this.selectedFiles.lettreMotivation!
    };

    this.demandeService.uploadDocuments(this.demande.email, files).subscribe({
      next: (response) => {
        console.log('✅ Documents uploadés avec succès:', response);
        this.finishSubmissionWithFiles();
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'upload des documents:', error);
        // La demande est créée mais pas les fichiers
        this.errorMessage = 'Demande créée avec succès, mais erreur lors de l\'upload des documents. Vous pourrez les ajouter plus tard.';
        this.loading = false;
        this.scrollToTop();
        
        // Rediriger quand même vers mes demandes après un délai
        setTimeout(() => {
          this.router.navigate(['/mes-demandes']);
        }, 4000);
      }
    });
  }

  /**
   * Finaliser la soumission avec fichiers
   */
  private finishSubmissionWithFiles() {
    this.successMessage = 'Votre demande et tous les documents ont été soumis avec succès ! Vous recevrez une réponse sous 5 à 10 jours ouvrables.';
    this.loading = false;
    this.scrollToTop();
    
    setTimeout(() => {
      this.router.navigate(['/mes-demandes']);
    }, 3000);
  }

  /**
   * Finaliser la soumission sans fichiers
   */
  private finishSubmissionWithoutFiles() {
    this.successMessage = 'Votre demande a été soumise avec succès ! N\'oubliez pas d\'ajouter vos documents. Vous recevrez une réponse sous 5 à 10 jours ouvrables.';
    this.loading = false;
    this.scrollToTop();
    
    setTimeout(() => {
      this.router.navigate(['/mes-demandes']);
    }, 3000);
  }

  // ===== GESTION DES FICHIERS =====

  /**
   * Gérer la sélection d'un fichier spécifique
   */
  onFileSelect(event: any, fileType: 'conventionStage' | 'demandeStage' | 'cv' | 'lettreMotivation') {
    const file = event.target.files[0];
    
    if (!file) return;

    // Valider le fichier
    if (!this.isValidFile(file)) {
      this.errorMessage = `Le fichier "${file.name}" n'est pas valide. Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5MB)`;
      event.target.value = ''; // Reset input
      return;
    }

    // Sauvegarder le fichier
    this.selectedFiles[fileType] = file;
    this.errorMessage = '';
    
    console.log(`✅ Fichier ${fileType} sélectionné:`, file.name);
  }

  /**
   * Gérer la sélection multiple (pour compatibilité avec le HTML existant)
   */
  onMultipleFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    if (files.length === 0) return;

    // Assigner automatiquement les fichiers selon leur ordre
    const fileTypes: Array<'conventionStage' | 'demandeStage' | 'cv' | 'lettreMotivation'> = 
      ['conventionStage', 'demandeStage', 'cv', 'lettreMotivation'];

    files.forEach((file, index) => {
      if (index < fileTypes.length && this.isValidFile(file)) {
        this.selectedFiles[fileTypes[index]] = file;
      }
    });

    console.log('✅ Fichiers sélectionnés:', this.selectedFiles);
  }

  /**
   * Valider un fichier
   */
  isValidFile(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  }

  /**
   * Vérifier que tous les fichiers requis sont sélectionnés
   */
  areAllFilesSelected(): boolean {
    return !!(
      this.selectedFiles.conventionStage &&
      this.selectedFiles.demandeStage &&
      this.selectedFiles.cv &&
      this.selectedFiles.lettreMotivation
    );
  }

  /**
   * Supprimer un fichier spécifique
   */
  removeFile(fileType: 'conventionStage' | 'demandeStage' | 'cv' | 'lettreMotivation') {
    delete this.selectedFiles[fileType];
    console.log(`❌ Fichier ${fileType} supprimé`);
  }

  /**
   * Obtenir le nom d'un fichier
   */
  getFileName(fileType: 'conventionStage' | 'demandeStage' | 'cv' | 'lettreMotivation'): string {
    return this.selectedFiles[fileType]?.name || '';
  }

  /**
   * Obtenir la taille formatée d'un fichier
   */
  getFileSize(file: File): string {
    if (!file) return '';
    
    const bytes = file.size;
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Vérifier si un fichier est sélectionné
   */
  isFileSelected(fileType: 'conventionStage' | 'demandeStage' | 'cv' | 'lettreMotivation'): boolean {
    return !!this.selectedFiles[fileType];
  }

  // ===== VALIDATION ET UTILITAIRES =====

  /**
   * Valider le format CIN
   */
  isValidCIN(cin: string): boolean {
    const cinPattern = /^[A-Z]{1,2}[0-9]{6}$/;
    return cinPattern.test(cin);
  }

  /**
   * Valider le format téléphone
   */
  isValidPhone(phone: string): boolean {
    const phonePattern = /^[0-9]{10}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  }

  /**
   * Valider les dates
   */
  areDatesValid(): boolean {
    if (!this.demande.dateDebut || !this.demande.dateFin) return true;
    
    const debut = new Date(this.demande.dateDebut);
    const fin = new Date(this.demande.dateFin);
    const aujourd_hui = new Date();
    
    // La date de début doit être future ou aujourd'hui
    if (debut < aujourd_hui) return false;
    
    // La date de fin doit être après la date de début
    if (fin <= debut) return false;
    
    return true;
  }

  /**
   * Calculer automatiquement la durée en mois
   */
  calculateDuree() {
    if (this.demande.dateDebut && this.demande.dateFin) {
      const debut = new Date(this.demande.dateDebut);
      const fin = new Date(this.demande.dateFin);
      
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.round(diffDays / 30);
      
      this.duree = `${diffMonths} mois`;
    }
  }

  // ===== MÉTHODES D'INTERFACE =====

  /**
   * Annuler et retourner à l'accueil
   */
  onCancel() {
    if (this.isFormDirty()) {
      if (confirm('Êtes-vous sûr de vouloir annuler ? Toutes les données saisies seront perdues.')) {
        this.router.navigate(['/home']);
      }
    } else {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Faire défiler vers le haut
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Obtenir les informations de l'utilisateur connecté
   */
  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  /**
   * Se déconnecter
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  // ===== ÉVÉNEMENTS DE VALIDATION EN TEMPS RÉEL =====

  /**
   * Valider CIN en temps réel
   */
  onCINChange() {
    if (this.demande.cin && !this.isValidCIN(this.demande.cin)) {
      console.log('⚠️ Format CIN invalide');
    }
  }

  /**
   * Valider téléphone en temps réel
   */
  onPhoneChange() {
    if (this.demande.telephone && !this.isValidPhone(this.demande.telephone)) {
      console.log('⚠️ Format téléphone invalide');
    }
  }

  /**
   * Valider les dates en temps réel
   */
  onDateChange() {
    this.calculateDuree();
    
    if (!this.areDatesValid()) {
      console.log('⚠️ Dates invalides');
    }
  }

  // ===== MÉTHODES D'AIDE =====

  /**
   * Formater une date pour l'affichage
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  /**
   * Vérifier si le formulaire a été modifié
   */
  isFormDirty(): boolean {
    return !!(
      this.demande.nom ||
      this.demande.prenom ||
      this.demande.cin ||
      this.demande.telephone ||
      this.diplome ||
      this.profil ||
      this.specialite ||
      this.demande.dateDebut ||
      this.demande.dateFin ||
      Object.keys(this.selectedFiles).length > 0
    );
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ?')) {
      this.demande = {
        nom: '',
        prenom: '',
        email: this.authService.getCurrentUser()?.email || '',
        telephone: '',
        cin: '',
        sexe: '',
        adresseDomicile: '',
        typeStage: '',
        dateDebut: '',
        dateFin: '',
        statut: 'EN_ATTENTE'
      };
      
      this.diplome = '';
      this.profil = '';
      this.specialite = '';
      this.duree = '';
      this.selectedFiles = {};
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  // ===== GETTERS POUR LE TEMPLATE =====

  /**
   * Obtenir le nombre de fichiers sélectionnés
   */
  get selectedFilesCount(): number {
    return Object.keys(this.selectedFiles).length;
  }

  /**
   * Obtenir la liste des types de fichiers manquants
   */
  get missingFileTypes(): string[] {
    const required = ['conventionStage', 'demandeStage', 'cv', 'lettreMotivation'];
    const labels = {
      conventionStage: 'Convention de stage',
      demandeStage: 'Demande de stage',
      cv: 'CV',
      lettreMotivation: 'Lettre de motivation'
    };
    
    return required
      .filter(type => !this.selectedFiles[type as keyof typeof this.selectedFiles])
      .map(type => labels[type as keyof typeof labels]);
  }
}