import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { Boutique } from '../../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './boutique-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutiqueDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  boutiqueId!: number;
  boutique: Boutique | null = null;
  loading = false;
  errorMessage = '';

  // Onglets
  activeTab: 'produits' | 'employes' | 'livreurs' | 'clients' = 'produits';

  // ✅ PAGINATION CLIENTS
  currentPage = 1;
  perPage = 15;
  loadingClients = false;

  // ✅ EXPOSER Math POUR LE TEMPLATE
  Math = Math;

  constructor(
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.boutiqueId = +this.route.snapshot.paramMap.get('id')!;
    this.loadBoutique();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoutique(page: number = 1): void {
    this.loading = page === 1; // Loading général seulement pour la page 1
    this.loadingClients = page > 1; // Loading clients pour les autres pages
    this.currentPage = page;
    this.cdr.markForCheck();

    this.boutiqueService.getById(this.boutiqueId, page, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boutique) => {
          this.boutique = boutique;
          this.loading = false;
          this.loadingClients = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement boutique:', err);
          this.errorMessage = 'Erreur lors du chargement de la boutique';
          this.loading = false;
          this.loadingClients = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ✅ NAVIGATION PAGINATION
  goToPage(page: number): void {
    if (page < 1 || !this.boutique?.clients_paginated) return;
    if (page > this.boutique.clients_paginated.last_page) return;

    this.loadBoutique(page);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.boutique?.clients_paginated && this.currentPage < this.boutique.clients_paginated.last_page) {
      this.goToPage(this.currentPage + 1);
    }
  }

  setActiveTab(tab: 'produits' | 'employes' | 'livreurs' | 'clients'): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

  getLogoUrl(logo: string | null): string {
    return this.boutiqueService.getLogoUrl(logo);
  }

  getStockClass(stock: number, seuil: number): string {
    if (stock < 0) return 'bg-red-100 text-red-700';
    if (stock <= seuil) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  }

  // TrackBy
  trackById = (_: number, item: any) => item.id;
}
