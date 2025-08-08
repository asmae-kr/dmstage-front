import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { DemandeStage } from '../../models/demande.model';

@Component({
  selector: 'app-admin-demandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './admin-demandes.component.html',
  styleUrls: ['./admin-demandes.component.css']
})
export class AdminDemandesComponent implements OnInit, OnDestroy {
  
  loading = false;
  demandes: DemandeStage[] = [];
  demandesFiltrees: DemandeStage[] = [];
  selectedDemande: DemandeStage | null = null;

  activeDropdown: number | null = null;

  searchTerm = '';
  dateDebut = '';
  dateFin = '';

  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(private adminService: AdminService) {}

ngOnInit(): void {
  this.chargerDemandes();
  
  // Initialiser la pile de navigation
  this.navigationStack = ['/login', '/admin/dashboard'];
}

  ngOnDestroy(): void {}

  toggleDropdown(demandeId: number, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === demandeId ? null : demandeId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.activeDropdown = null;
  }

  changerStatut(demande: DemandeStage, nouveauStatut: string, event: Event): void {
    event.stopPropagation();

    // Changement: utiliser ACCEPTEE et REFUSEE au lieu de ACCEPTE et REFUSE
    const statutsValides: ('EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE')[] = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE'];
    const statutValide = statutsValides.find(s => s === nouveauStatut) as 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

    if (!statutValide || demande.statut === statutValide) {
      this.activeDropdown = null;
      return;
    }

    const ancienStatut = demande.statut;
    demande.statut = statutValide;
    this.activeDropdown = null;

    if (demande.id !== undefined) {
      this.adminService.changerStatutDemande(demande.id, statutValide).subscribe({
        next: (response) => {
          console.log(`✅ Statut changé avec succès pour la demande #${demande.id}: ${statutValide}`);
          this.afficherNotification(`Statut mis à jour: ${this.getStatutLabel(statutValide)}`, 'success');
        },
        error: (error) => {
          console.error('❌ Erreur lors du changement de statut:', error);
          demande.statut = ancienStatut;
          this.afficherNotification('Erreur lors de la mise à jour du statut', 'error');
        }
      });
    }
  }

  getOptionsStatut(statutActuel: string): Array<{value: string, label: string, class: string}> {
    // Changement: utiliser ACCEPTEE et REFUSEE
    const options = [
      { value: 'EN_ATTENTE', label: 'En attente', class: 'attente' },
      { value: 'ACCEPTEE', label: 'Acceptée', class: 'accepte' },
      { value: 'REFUSEE', label: 'Refusée', class: 'refuse' }
    ];
    return options.filter(option => option.value !== statutActuel);
  }
  

chargerDemandes(): void {
  this.loading = true;
  
  // UTILISER LES DONNÉES DE TEST pour le moment
 setTimeout(() => {
  const testData = this.genererDonneesTest();
  this.demandes = testData;
  this.totalElements = testData.length;
  this.totalPages = Math.ceil(testData.length / this.pageSize);
  
  // FORCER l'affichage de la pagination pour les tests
  this.totalPages = Math.max(this.totalPages, 2); // Au minimum 2 pages
  
  this.appliquerFiltres();
  this.loading = false;
}, 500);
  
  // Code commenté pour plus tard quand le service sera prêt :
  /*
  this.adminService.getAllDemandes({
    page: this.currentPage,
    size: this.pageSize
  }).subscribe({
    next: (response) => {
      this.demandes = response.content || [];
      this.totalElements = response.totalElements || 0;
      this.totalPages = response.totalPages || 0;
      this.appliquerFiltres();
      this.loading = false;
    },
    error: (error) => {
      console.error('Erreur lors du chargement des demandes:', error);
      this.loading = false;
    }
  });
  */
}
  rechercherDemandes(): void {
    this.appliquerFiltres();
  }

  appliquerFiltres(): void {
    let demandesFiltrees = [...this.demandes];

    if (this.searchTerm.trim()) {
      const terme = this.searchTerm.toLowerCase();
      demandesFiltrees = demandesFiltrees.filter(demande =>
        demande.nom.toLowerCase().includes(terme) ||
        demande.prenom.toLowerCase().includes(terme) ||
        demande.email.toLowerCase().includes(terme) ||
        demande.typeStage.toLowerCase().includes(terme)
      );
    }

    if (this.dateDebut) {
      const debut = new Date(this.dateDebut);
      demandesFiltrees = demandesFiltrees.filter(demande =>
        new Date(demande.dateDemande) >= debut
      );
    }

    if (this.dateFin) {
      const fin = new Date(this.dateFin);
      demandesFiltrees = demandesFiltrees.filter(demande =>
        new Date(demande.dateDemande) <= fin
      );
    }

    this.demandesFiltrees = demandesFiltrees;
  }

  trierPar(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.demandesFiltrees.sort((a, b) => {
      let valueA = (a as any)[field];
      let valueB = (b as any)[field];

      if (field === 'dateDemande') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  getBadgeClass(statut: string): string {
    // Changement: utiliser ACCEPTEE et REFUSEE
    switch (statut) {
      case 'EN_ATTENTE': return 'badge-en-attente';
      case 'ACCEPTEE': return 'badge-accepte';
      case 'REFUSEE': return 'badge-refuse';
      default: return 'badge-en-attente';
    }
  }

  getStatutLabel(statut: string): string {
    // Changement: utiliser ACCEPTEE et REFUSEE
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ACCEPTEE': return 'Acceptée';
      case 'REFUSEE': return 'Refusée';
      default: return statut;
    }
  }

  ouvrirDetails(demande: DemandeStage): void {
    this.selectedDemande = demande;
  }

  fermerModal(): void {
    this.selectedDemande = null;
  }

exporterDemandes(): void {
  console.log('🔄 Début de l\'export Excel...');
  
  // Préparer les critères d'export avec les filtres appliqués
  const exportCriteria: any = {};
  
  // Ajouter les filtres de date s'ils existent
  if (this.dateDebut) {
    exportCriteria.dateDebut = this.dateDebut;
  }
  if (this.dateFin) {
    exportCriteria.dateFin = this.dateFin;
  }
  
  // Afficher un message de chargement
  this.afficherNotification('Export Excel en cours...', 'info');
  
  // Appeler le service d'export
  this.adminService.exporterDemandes(exportCriteria).subscribe({
    next: (blob: Blob) => {
      console.log('✅ Export Excel reçu du serveur');
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Nom du fichier avec la date actuelle
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `demandes_stage_${dateStr}.xlsx`;
      
      // Déclencher le téléchargement
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      this.afficherNotification('Export Excel terminé avec succès !', 'success');
    },
    error: (error) => {
      console.error('❌ Erreur lors de l\'export Excel:', error);
      this.afficherNotification('Erreur lors de l\'export Excel. Veuillez réessayer.', 'error');
    }
  });
}

private afficherNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Affichage temporaire avec alert (à remplacer par un toast plus tard)
  if (type === 'success') {
    alert(`✅ ${message}`);
  } else if (type === 'error') {
    alert(`❌ ${message}`);
  } else if (type === 'info') {
    alert(`ℹ️ ${message}`);
  } else {
    alert(`⚠️ ${message}`);
  }
}

  private genererDonneesTest(): DemandeStage[] {
  return [
    {
      id: 1,
      nom: 'Benali',
      prenom: 'Ahmed',
      email: 'ahmed.benali@email.com',
      telephone: '0601010101',
      cin: 'AB123456',
      sexe: 'Homme',
      adresseDomicile: '123 Rue Exemple, Casablanca',
      typeStage: 'Stage d\'observation',
      dateDebut: '2024-02-01',
      dateFin: '2024-02-28',
      dateDemande: new Date('2024-01-15'),
      statut: 'EN_ATTENTE',
      dateCreation: '2024-01-15',
      dateModification: '2024-01-15',
      commentaire: 'Première demande de stage',
      cvFileName: 'cv_ahmed_benali.pdf'
    },
    {
      id: 2,
      nom: 'Alaoui',
      prenom: 'Fatima',
      email: 'fatima.alaoui@email.com',
      telephone: '0602020202',
      cin: 'CD234567',
      sexe: 'Femme',
      adresseDomicile: '456 Avenue Exemple, Rabat',
      typeStage: 'Stage technique',
      dateDebut: '2024-03-01',
      dateFin: '2024-03-31',
      dateDemande: new Date('2024-01-16'),
      statut: 'ACCEPTEE',  // Changement: ACCEPTEE au lieu de ACCEPTE
      dateCreation: '2024-01-16',
      dateModification: '2024-01-20',
      commentaire: 'Excellente candidate',
      cvFileName: 'cv_fatima_alaoui.pdf'
    },
    {
      id: 3,
      nom: 'Idrissi',
      prenom: 'Mohamed',
      email: 'mohamed.idrissi@email.com',
      telephone: '0603030303',
      cin: 'EF345678',
      sexe: 'Homme',
      adresseDomicile: '789 Boulevard Exemple, Marrakech',
      typeStage: 'Stage de formation',
      dateDebut: '2024-04-01',
      dateFin: '2024-04-30',
      dateDemande: new Date('2024-01-17'),
      statut: 'REFUSEE',  // Changement: REFUSEE au lieu de REFUSE
      dateCreation: '2024-01-17',
      dateModification: '2024-01-25',
      commentaire: 'Profil non adapté',
      cvFileName: 'cv_mohamed_idrissi.pdf'
    },
    {
      id: 4,
      nom: 'Tazi',
      prenom: 'Khadija',
      email: 'khadija.tazi@email.com',
      telephone: '0604040404',
      cin: 'GH456789',
      sexe: 'Femme',
      adresseDomicile: '1010 Rue Exemple, Fès',
      typeStage: 'Stage d\'observation',
      dateDebut: '2024-05-01',
      dateFin: '2024-05-15',
      dateDemande: new Date('2024-01-18'),
      statut: 'EN_ATTENTE',
      dateCreation: '2024-01-18',
      dateModification: '2024-01-18',
      commentaire: 'Demande en cours d\'évaluation',
      cvFileName: 'cv_khadija_tazi.pdf'
    },
    {
      id: 5,
      nom: 'Chakib',
      prenom: 'Youssef',
      email: 'youssef.chakib@email.com',
      telephone: '0605050505',
      cin: 'IJ567890',
      sexe: 'Homme',
      adresseDomicile: '2020 Avenue Exemple, Tanger',
      typeStage: 'Stage technique',
      dateDebut: '2024-06-01',
      dateFin: '2024-06-30',
      dateDemande: new Date('2024-01-19'),
      statut: 'ACCEPTEE',  // Changement: ACCEPTEE au lieu de ACCEPTE
      dateCreation: '2024-01-19',
      dateModification: '2024-01-22',
      commentaire: 'Candidat très qualifié',
      cvFileName: 'cv_youssef_chakib.pdf'
    }
  ];
}
private navigationStack: string[] = [];

retourPage(): void {
  if (this.navigationStack.length > 0) {
    const previousPage = this.navigationStack.pop();
    if (previousPage) {
      // Utiliser Router pour naviguer
      window.location.href = previousPage; // Solution simple
      // OU avec Router injection : this.router.navigate([previousPage]);
    }
  } else {
    // Fallback
    window.location.href = '/admin/dashboard';
  }
}
  changerPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.chargerDemandes();
    }
  }

  changerTaillePage(): void {
    this.currentPage = 0;
    this.chargerDemandes();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
  getStartIndex(): number {
  return this.currentPage * this.pageSize + 1;
}

getEndIndex(): number {
  const end = (this.currentPage + 1) * this.pageSize;
  return Math.min(end, this.totalElements);
}

}