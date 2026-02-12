import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ProduitService, PaginatedProduits, Produit } from '../../../core/services/produit.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-produit-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './produit-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class ProduitListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP
  private searchSubject$ = new Subject<string>(); // ✅ DEBOUNCE SEARCH

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
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce(); // ✅ DEBOUNCE
    this.loadProduits();
    this.listenBoutiqueChange(); // ✅ ÉCOUTE BOUTIQUE
  }

  ngOnDestroy(): void {
    // ✅ CLEANUP
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ DEBOUNCE RECHERCHE (300ms)
  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filters.page = 1;
        this.loadProduits();
      });
  }

  // ✅ ÉCOUTE CHANGEMENT BOUTIQUE
  private listenBoutiqueChange(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filters.page = 1;
        this.loadProduits();
      });
  }

  loadProduits(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // ✅ CORRECTION : Construire params sans valeurs null
    const params: any = {
      per_page: this.filters.per_page,
      page: this.filters.page,
    };

    // Ajouter boutique_id si admin
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    // Ajouter recherche si présente
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }

    // ✅ CORRECTION : N'ajouter actif QUE si non-null
    if (this.filters.actif !== null) {
      params.actif = this.filters.actif;
    }

    // Ajouter categorie_id si présent
    if (this.filters.categorie_id) {
      params.categorie_id = this.filters.categorie_id;
    }

    this.produitService.getAll(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedProduits) => {
          this.produits = response.data;
          this.pagination = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement produits:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchQuery); // ✅ TRIGGER DEBOUNCE
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
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.produitToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.produitService.delete(this.produitToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Produit supprimé avec succès !';
          this.showDeleteModal = false;
          this.produitToDelete = null;
          this.deleteLoading = false;
          this.loadProduits();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
          this.deleteLoading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.markForCheck();
          }, 5000);
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

  getStockBadgeClass(produit: Produit): string {
    if (produit.stock <= 0) return 'bg-red-100 text-red-700';
    if (produit.stock <= produit.seuil_alerte) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  }

  // ✅ TRACKBY FUNCTION
  trackByProduitId = (_: number, produit: Produit) => produit.id;
}
