import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { Boutique } from '../../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './boutique-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutiqueListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  boutiques: Boutique[] = [];
  boutiquesFiltered: Boutique[] = [];
  loading = false;
  searchQuery = '';

  successMessage = '';
  errorMessage = '';

  // Suppression
  showDeleteModal = false;
  boutiqueToDelete: Boutique | null = null;
  deleteLoading = false;

  constructor(
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoutiques(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.boutiqueService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boutiques: Boutique[]) => {
          this.boutiques = boutiques;
          this.filterBoutiques();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement boutiques:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filterBoutiques();
  }

  filterBoutiques(): void {
    if (!this.searchQuery.trim()) {
      this.boutiquesFiltered = this.boutiques;
    } else {
      const search = this.searchQuery.toLowerCase();
      this.boutiquesFiltered = this.boutiques.filter(b =>
        b.nom.toLowerCase().includes(search) ||
        b.adresse.toLowerCase().includes(search) ||
        b.telephone.includes(search)
      );
    }
    this.cdr.markForCheck();
  }

  toggleStatus(boutique: Boutique): void {
    this.boutiqueService.toggleStatus(boutique.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Statut modifié avec succès !';
          this.loadBoutiques();
          this.cdr.markForCheck();
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.markForCheck();
          }, 3000);
        },
        error: (err) => {
          console.error('Erreur toggle status:', err);
          this.errorMessage = 'Erreur lors du changement de statut';
          this.cdr.markForCheck();
        },
      });
  }

  openDeleteModal(boutique: Boutique): void {
    this.boutiqueToDelete = boutique;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.boutiqueToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.boutiqueService.delete(this.boutiqueToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Boutique supprimée avec succès !';
          this.showDeleteModal = false;
          this.boutiqueToDelete = null;
          this.deleteLoading = false;
          this.loadBoutiques();
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
        },
      });
  }

  getLogoUrl(logo: string | null): string {
    return this.boutiqueService.getLogoUrl(logo);
  }

  // TrackBy
  trackByBoutiqueId = (_: number, boutique: Boutique) => boutique.id;
}
