import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService, PaginatedCommandes, Commande } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-list.component.html',
})
export class CommandeListComponent implements OnInit {
  commandes: Commande[] = [];
  pagination: any = null;
  loading = false;

  searchQuery = '';
  isSearching = false;
  successMessage = '';
  errorMessage = '';

  filters = {
    per_page: 15,
    page: 1,
  };

  // Modal annulation
  showAnnulerModal = false;
  commandeToAnnuler: Commande | null = null;
  raisonAnnulation = '';
  annulerLoading = false;

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;
    const boutique = this.boutiqueService.getSelectedBoutique();

    const params: any = { ...this.filters };
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.commandeService.getAll(params).subscribe({
      next: (response: PaginatedCommandes) => {
        this.commandes = response.data;
        this.pagination = response;
        this.loading = false;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.loading = false;
        this.isSearching = false;
      },
    });
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.loadCommandes();
      return;
    }

    this.isSearching = true;
    this.loading = true;
    const boutique = this.boutiqueService.getSelectedBoutique();

    this.commandeService.search(this.searchQuery, {
      boutique_id: boutique?.id,
      per_page: this.filters.per_page,
      page: 1,
    }).subscribe({
      next: (response: PaginatedCommandes) => {
        this.commandes = response.data;
        this.pagination = response;
        this.loading = false;
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Erreur recherche:', err);
        this.loading = false;
        this.isSearching = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    if (this.isSearching) {
      this.onSearchChange();
    } else {
      this.loadCommandes();
    }
  }

  openAnnulerModal(commande: Commande): void {
    this.commandeToAnnuler = commande;
    this.showAnnulerModal = true;
    this.raisonAnnulation = '';
  }

  confirmAnnuler(): void {
    if (!this.commandeToAnnuler || !this.raisonAnnulation.trim()) {
      this.errorMessage = 'Veuillez saisir une raison d\'annulation';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    this.annulerLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.commandeService.annuler(this.commandeToAnnuler.id, this.raisonAnnulation).subscribe({
      next: () => {
        this.successMessage = 'Commande annulée avec succès !';
        this.showAnnulerModal = false;
        this.commandeToAnnuler = null;
        this.raisonAnnulation = '';
        this.annulerLoading = false;
        this.loadCommandes();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de l\'annulation';
        this.annulerLoading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'validee': return 'bg-green-100 text-green-700';
      case 'annulee': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'validee': return 'Validée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }
}
