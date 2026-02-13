import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategorieService, Categorie, Produit } from '../../../core/services/categorie.service';

@Component({
  selector: 'app-categorie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categorie-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategorieDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categorieId!: number;
  categorie: Categorie | null = null;
  loading = false;
  errorMessage = '';

  // Suppression
  showDeleteModal = false;
  deleteLoading = false;

  constructor(
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categorieId = +this.route.snapshot.paramMap.get('id')!;
    this.loadCategorie();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategorie(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.categorieService.getById(this.categorieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorie) => {
          this.categorie = categorie;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement catégorie:', err);
          this.errorMessage = 'Erreur lors du chargement de la catégorie';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.categorie) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.categorieService.delete(this.categorie.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
          this.deleteLoading = false;
          this.showDeleteModal = false;
          this.cdr.markForCheck();
        },
      });
  }

  // Méthode pour déterminer la couleur du badge stock
  getStockClass(produit: Produit): string {
    if (produit.stock < 0) return 'bg-red-100 text-red-700';
    if (produit.stock <= produit.seuil_alerte) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  }

  // TrackBy
  trackByProduitId = (_: number, produit: Produit) => produit.id;
}
