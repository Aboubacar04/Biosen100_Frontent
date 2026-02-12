import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ClientService, Client, PaginatedClients } from '../../../core/services/client.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  boutiqueId: number | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  // ─── Données ──────────────────────────────────────────────
  clients: Client[] = [];
  pagination: any = null;

  // ─── Filtres ──────────────────────────────────────────────
  searchQuery = '';
  filters = {
    actif: null as boolean | null,
    per_page: 15,
    page: 1,
  };

  // ─── Modal suppression ────────────────────────────────────
  showDeleteModal = false;
  clientToDelete: Client | null = null;
  deleteLoading = false;

  // ─── Scroll to top ────────────────────────────────────────
  showScrollTop = false;

  constructor(
    private clientService: ClientService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Écoute changement de boutique
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.filters.page = 1;
        this.loadClients();
      });

    // Scroll listener
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
  loadClients(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = { ...this.filters };
    if (this.boutiqueId) {
      params.boutique_id = this.boutiqueId;
    }
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }

    this.clientService.getAll(params).subscribe({
      next: (response: PaginatedClients) => {
        this.clients = response.data;
        this.pagination = response;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement clients:', err);
        this.errorMessage = 'Erreur lors du chargement des clients';
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.errorMessage = '';
          this.cdr.markForCheck();
        }, 5000);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════
  onSearchChange(): void {
    this.filters.page = 1;
    this.loadClients();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadClients();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadClients();
    this.scrollToTop();
  }

  openDeleteModal(client: Client): void {
    this.clientToDelete = client;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.clientToDelete = null;
    this.cdr.markForCheck();
  }

  confirmDelete(): void {
    if (!this.clientToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.clientService.delete(this.clientToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Client supprimé avec succès !';
        this.showDeleteModal = false;
        this.clientToDelete = null;
        this.deleteLoading = false;
        this.loadClients();
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
  // TRACKBY (PERFORMANCE)
  // ═══════════════════════════════════════════════════════════
  trackById(_: number, item: Client): number {
    return item.id;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════
  get totalPages(): number {
    return this.pagination?.last_page || 1;
  }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.filters.page;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1);
    }
    if (current + delta < total - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (total > 1) {
      range.push(total);
    }

    return range;
  }

  getStatutClass(actif: boolean): string {
    return actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500';
  }

  getStatutLabel(actif: boolean): string {
    return actif ? 'Actif' : 'Inactif';
  }
}
