import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LivreurService, Livreur } from '../../../core/services/livreur.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-livreur-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './livreur-list.component.html',
})
export class LivreurListComponent implements OnInit {
  livreurs: Livreur[] = [];
  loading = false;

  searchQuery = '';
  successMessage = '';
  errorMessage = '';

  // Suppression
  showDeleteModal = false;
  livreurToDelete: Livreur | null = null;
  deleteLoading = false;

  constructor(
    private livreurService: LivreurService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.loadLivreurs();
  }

  loadLivreurs(): void {
    this.loading = true;

    const boutique = this.boutiqueService.getSelectedBoutique();
    const filters: any = boutique ? { boutique_id: boutique.id } : {};

    if (this.searchQuery.trim()) {
      filters.search = this.searchQuery;
    }

    this.livreurService.getAll(filters).subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement livreurs:', err);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.loadLivreurs();
  }

  openDeleteModal(livreur: Livreur): void {
    this.livreurToDelete = livreur;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.livreurToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.livreurService.delete(this.livreurToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Livreur supprimé avec succès !';
        this.showDeleteModal = false;
        this.livreurToDelete = null;
        this.deleteLoading = false;
        this.loadLivreurs();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        this.deleteLoading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  toggleDisponibilite(livreur: Livreur): void {
    this.livreurService.toggleDisponibilite(livreur.id).subscribe({
      next: (response) => {
        livreur.disponible = response.livreur.disponible;
        this.successMessage = 'Disponibilité mise à jour !';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur toggle disponibilité:', err);
        this.errorMessage = err.error?.message || 'Erreur';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  toggleActif(livreur: Livreur): void {
    const action = livreur.actif
      ? this.livreurService.desactiver(livreur.id)
      : this.livreurService.activer(livreur.id);

    action.subscribe({
      next: (response) => {
        livreur.actif = response.livreur.actif;
        this.successMessage = 'Statut mis à jour !';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur toggle actif:', err);
        this.errorMessage = err.error?.message || 'Erreur';
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
