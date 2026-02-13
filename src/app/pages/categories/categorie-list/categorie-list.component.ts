import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CategorieService, Categorie } from '../../../core/services/categorie.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-categorie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categorie-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class CategorieListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP
  private searchSubject$ = new Subject<string>(); // ✅ DEBOUNCE

  categories: Categorie[] = [];
  categoriesFiltered: Categorie[] = [];
  loading = false;
  searchQuery = '';

  successMessage = '';
  errorMessage = '';

  // Suppression
  showDeleteModal = false;
  categorieToDelete: Categorie | null = null;
  deleteLoading = false;

  constructor(
    private categorieService: CategorieService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCategories();
    this.listenBoutiqueChange();
  }

  ngOnDestroy(): void {
    // ✅ CLEANUP
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ RECHERCHE AVEC DEBOUNCE
  private setupSearchDebounce(): void {
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.filterCategories());
  }

  // ✅ ÉCOUTE CHANGEMENT BOUTIQUE
  private listenBoutiqueChange(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadCategories());
  }

  loadCategories(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = {};
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.categorieService.getAll(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Categorie[]) => {
          this.categories = categories;
          this.filterCategories();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement catégories:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject$.next(query);
  }

  filterCategories(): void {
    if (!this.searchQuery.trim()) {
      this.categoriesFiltered = this.categories;
    } else {
      const search = this.searchQuery.toLowerCase();
      this.categoriesFiltered = this.categories.filter(c =>
        c.nom.toLowerCase().includes(search) ||
        (c.description && c.description.toLowerCase().includes(search))
      );
    }
    this.cdr.markForCheck();
  }

  openDeleteModal(categorie: Categorie): void {
    this.categorieToDelete = categorie;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.categorieToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.categorieService.delete(this.categorieToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Catégorie supprimée avec succès !';
          this.showDeleteModal = false;
          this.categorieToDelete = null;
          this.deleteLoading = false;
          this.loadCategories();
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

  // ✅ TRACKBY FUNCTION
  trackByCategorieId = (_: number, categorie: Categorie) => categorie.id;
}
