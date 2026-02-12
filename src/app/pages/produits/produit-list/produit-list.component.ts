import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService, PaginatedProduits, Produit } from '../../../core/services/produit.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produit-list.component.html',
})
export class ProduitListComponent implements OnInit {
  produits: Produit[] = [];
  pagination: any = null;
  loading = false;

  searchQuery = '';
  successMessage = '';
  errorMessage = '';

  filters = {
    categorie_id: null as number | null,
    actif: null as boolean | null,
    per_page: 15,
    page: 1,
  };

  // Suppression
  showDeleteModal = false;
  produitToDelete: Produit | null = null;
  deleteLoading = false;

  constructor(
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.loading = true;

    const params: any = { ...this.filters };
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }

    this.produitService.getAll(params).subscribe({
      next: (response: PaginatedProduits) => {
        this.produits = response.data;
        this.pagination = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.filters.page = 1;
    this.loadProduits();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadProduits();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProduits();
  }

  openDeleteModal(produit: Produit): void {
    this.produitToDelete = produit;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.produitToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.produitService.delete(this.produitToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Produit supprimé avec succès !';
        this.showDeleteModal = false;
        this.produitToDelete = null;
        this.deleteLoading = false;
        this.loadProduits();
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

  getImageUrl(image: string | null): string {
    if (!image) return '/assets/default-product.png';
    return `http://localhost:8000/storage/${image}`;
  }

  getStockClass(produit: Produit): string {
    if (produit.stock <= 0) return 'text-red-600';
    if (produit.stock <= produit.seuil_alerte) return 'text-orange-600';
    return 'text-green-600';
  }
}
