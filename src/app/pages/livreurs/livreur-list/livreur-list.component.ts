import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { LivreurService, Livreur, PaginatedLivreurs } from '../../../core/services/livreur.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-livreur-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './livreur-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivreurListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // ─── États ────────────────────────────────────────────────
  boutiqueId: number | null = null;
  loading = false;
  livreurs: Livreur[] = [];

  // ─── Pagination ───────────────────────────────────────────
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 15;
  from = 0;
  to = 0;

  // ─── Filtres ──────────────────────────────────────────────
  searchTerm = '';
  filtreActif: boolean | null = null;
  filtreDisponible: boolean | null = null;

  // ─── Messages ─────────────────────────────────────────────
  successMessage = '';
  errorMessage = '';

  // ─── Modal suppression ────────────────────────────────────
  showDeleteModal = false;
  livreurToDelete: Livreur | null = null;
  loadingDelete = false;

  // ─── Scroll to top ────────────────────────────────────────
  showScrollTop = false;

  constructor(
    private livreurService: LivreurService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Écoute changement boutique
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.resetAndLoad();
      });

    // Recherche avec debounce
    this.searchSubject$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(term => {
        this.searchTerm = term;
        this.resetAndLoad();
      });

    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  // ═══════════════════════════════════════════════════════════
  // CHARGEMENT DONNÉES
  // ═══════════════════════════════════════════════════════════
  loadLivreurs(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const filters: any = {
      boutique_id: this.boutiqueId ?? undefined,
      actif: this.filtreActif,
      disponible: this.filtreDisponible,
      search: this.searchTerm || undefined,
      per_page: this.perPage,
      page: this.currentPage,
    };

    this.livreurService.getAll(filters).subscribe({
      next: (response: PaginatedLivreurs) => {
        this.livreurs = response.data;
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.total = response.total;
        this.from = response.from;
        this.to = response.to;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors du chargement des livreurs';
        this.loading = false;
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

  resetAndLoad(): void {
    this.currentPage = 1;
    this.loadLivreurs();
  }

  // ═══════════════════════════════════════════════════════════
  // RECHERCHE ET FILTRES
  // ═══════════════════════════════════════════════════════════
  onSearchChange(term: string): void {
    this.searchSubject$.next(term);
  }

  onFiltreActifChange(value: string): void {
    if (value === 'all') {
      this.filtreActif = null;
    } else {
      this.filtreActif = value === 'true';
    }
    this.resetAndLoad();
  }

  onFiltreDisponibleChange(value: string): void {
    if (value === 'all') {
      this.filtreDisponible = null;
    } else {
      this.filtreDisponible = value === 'true';
    }
    this.resetAndLoad();
  }

  onPerPageChange(value: number): void {
    this.perPage = value;
    this.resetAndLoad();
  }

  // ═══════════════════════════════════════════════════════════
  // PAGINATION
  // ═══════════════════════════════════════════════════════════
  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage && page !== this.currentPage) {
      this.currentPage = page;
      this.loadLivreurs();
      this.scrollToTop();
    }
  }

  get pages(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (let i = 1; i <= this.lastPage; i++) {
      if (i === 1 || i === this.lastPage ||
          (i >= this.currentPage - delta && i <= this.currentPage + delta)) {
        range.push(i);
      }
    }

    let prev: number | null = null;
    for (const i of range) {
      if (prev && i - prev > 1) {
        rangeWithDots.push(-1);
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  }

  // ═══════════════════════════════════════════════════════════
  // SUPPRESSION
  // ═══════════════════════════════════════════════════════════
  openDeleteModal(livreur: Livreur): void {
    this.livreurToDelete = livreur;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.livreurToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.livreurToDelete) return;

    this.loadingDelete = true;
    this.cdr.markForCheck();

    this.livreurService.delete(this.livreurToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Livreur supprimé avec succès';
        this.closeDeleteModal();
        this.loadingDelete = false;
        this.loadLivreurs();
        this.autoHideMessage('success');
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        this.loadingDelete = false;
        this.closeDeleteModal();
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // TOGGLE DISPONIBILITÉ
  // ═══════════════════════════════════════════════════════════
  toggleDisponibilite(livreur: Livreur): void {
    this.livreurService.toggleDisponibilite(livreur.id).subscribe({
      next: () => {
        this.successMessage = 'Disponibilité mise à jour';
        this.loadLivreurs();
        this.autoHideMessage('success');
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Erreur lors de la mise à jour';
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════════════════════
  autoHideMessage(type: 'success' | 'error'): void {
    setTimeout(() => {
      if (type === 'success') {
        this.successMessage = '';
      } else {
        this.errorMessage = '';
      }
      this.cdr.markForCheck();
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════
  // SCROLL TO TOP
  // ═══════════════════════════════════════════════════════════
  onScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
    this.cdr.markForCheck();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════
  // TRACKBY
  // ═══════════════════════════════════════════════════════════
  trackById(_: number, item: Livreur): number {
    return item.id;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════
  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
