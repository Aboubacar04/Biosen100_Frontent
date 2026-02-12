import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProduitService, Produit } from '../../../core/services/produit.service';

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './produit-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class ProduitDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP

  produit: Produit | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {}

  ngOnInit(): void {
    this.loadProduit();
  }

  ngOnDestroy(): void {
    // ✅ CLEANUP
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/produits']);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.produitService.getById(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (produit) => {
          this.produit = produit;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement produit:', err);
          this.errorMessage = 'Produit introuvable';
          this.loading = false;
          this.cdr.markForCheck();
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

  getStockLabel(produit: Produit): string {
    if (produit.stock <= 0) return 'Rupture de stock';
    if (produit.stock <= produit.seuil_alerte) return 'Stock faible';
    return 'En stock';
  }
}
