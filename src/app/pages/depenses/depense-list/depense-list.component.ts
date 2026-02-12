import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DepenseService, PaginatedDepenses, Depense } from '../../../core/services/depense.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-depense-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './depense-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class DepenseListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP

  depenses: Depense[] = [];
  pagination: any = null;
  loading = false;

  successMessage = '';
  errorMessage = '';

  filters = {
    per_page: 15,
    page: 1,
    categorie: '' as string,
  };

  // Catégories disponibles
  categories = [
    'Loyer',
    'Salaires',
    'Électricité',
    'Eau',
    'Téléphone/Internet',
    'Fournitures',
    'Transport',
    'Entretien',
    'Autre'
  ];

  // Suppression
  showDeleteModal = false;
  depenseToDelete: Depense | null = null;
  deleteLoading = false;

  constructor(
    private depenseService: DepenseService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {}

  ngOnInit(): void {
    this.loadDepenses();
    this.listenBoutiqueChange(); // ✅ ÉCOUTE BOUTIQUE
  }

  ngOnDestroy(): void {
    // ✅ CLEANUP
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ ÉCOUTE CHANGEMENT BOUTIQUE
  private listenBoutiqueChange(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filters.page = 1;
        this.loadDepenses();
      });
  }

  loadDepenses(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = {
      per_page: this.filters.per_page,
      page: this.filters.page,
    };

    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.depenseService.getAll(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedDepenses) => {
          // Filtrer par catégorie côté frontend si nécessaire
          if (this.filters.categorie) {
            this.depenses = response.data.filter(d => d.categorie === this.filters.categorie);
          } else {
            this.depenses = response.data;
          }
          this.pagination = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement dépenses:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadDepenses();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadDepenses();
  }

  openDeleteModal(depense: Depense): void {
    this.depenseToDelete = depense;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.depenseToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.depenseService.delete(this.depenseToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Dépense supprimée avec succès !';
          this.showDeleteModal = false;
          this.depenseToDelete = null;
          this.deleteLoading = false;
          this.loadDepenses();
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

  getCategorieColor(categorie: string): string {
    const colors: { [key: string]: string } = {
      'Loyer': 'bg-blue-100 text-blue-700',
      'Salaires': 'bg-green-100 text-green-700',
      'Électricité': 'bg-yellow-100 text-yellow-700',
      'Eau': 'bg-cyan-100 text-cyan-700',
      'Téléphone/Internet': 'bg-purple-100 text-purple-700',
      'Fournitures': 'bg-pink-100 text-pink-700',
      'Transport': 'bg-orange-100 text-orange-700',
      'Entretien': 'bg-red-100 text-red-700',
      'Autre': 'bg-gray-100 text-gray-700',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-700';
  }

  // ✅ TRACKBY FUNCTION
  trackByDepenseId = (_: number, depense: Depense) => depense.id;
}
