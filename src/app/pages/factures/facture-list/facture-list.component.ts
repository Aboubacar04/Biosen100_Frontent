import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FactureService, PaginatedFactures, Facture, ResumeFactures } from '../../../core/services/facture.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { Boutique } from '../../../core/models/boutique.model';

type FiltrePeriode = 'tout' | 'aujourdhui' | 'semaine' | 'mois' | 'annee';

@Component({
  selector: 'app-facture-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './facture-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactureListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  factures: Facture[] = [];
  paginationData: PaginatedFactures | null = null;
  resume: ResumeFactures | null = null;
  loading = false;
  selectedBoutique: Boutique | null = null;

  currentPage = 1;
  perPage = 15;
  Math = Math;

  searchControl = new FormControl('');
  filtrePeriode: FiltrePeriode = 'tout';

  constructor(
    private factureService: FactureService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBoutiqueSelected();
    this.loadFactures();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBoutiqueSelected(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.selectedBoutique = boutique;
        this.currentPage = 1;
        this.loadFactures();
      });
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.currentPage = 1;
        if (value && value.trim()) {
          this.rechercher(value);
        } else {
          this.loadFactures();
        }
      });
  }

  // ─────────────────────────────────────────────────────────────
  // 📋 CHARGER FACTURES
  // ─────────────────────────────────────────────────────────────
  loadFactures(page: number = this.currentPage): void {
    this.loading = true;
    this.currentPage = page;
    this.cdr.markForCheck();

    const boutiqueId = this.selectedBoutique?.id;

    switch (this.filtrePeriode) {
      case 'aujourdhui':
        this.chargerAujourdhui(boutiqueId, page);
        break;
      case 'semaine':
        this.chargerSemaine(boutiqueId, page);
        break;
      case 'mois':
        this.chargerMois(boutiqueId, page);
        break;
      case 'annee':
        this.chargerAnnee(boutiqueId, page);
        break;
      default:
        this.chargerTout(boutiqueId, page);
    }
  }

  chargerTout(boutiqueId?: number, page: number = 1): void {
    this.factureService.getAll(page, this.perPage, boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data;
          this.factures = data.data;
          this.resume = null;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  chargerAujourdhui(boutiqueId?: number, page: number = 1): void {
    this.factureService.aujourdhui(boutiqueId, page, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data.factures;
          this.factures = data.factures.data;
          this.resume = data.resume;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  chargerSemaine(boutiqueId?: number, page: number = 1): void {
    this.factureService.semaine(boutiqueId, page, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data.factures;
          this.factures = data.factures.data;
          this.resume = data.resume;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  chargerMois(boutiqueId?: number, page: number = 1): void {
    this.factureService.mois(boutiqueId, undefined, undefined, page, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data.factures;
          this.factures = data.factures.data;
          this.resume = data.resume;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  chargerAnnee(boutiqueId?: number, page: number = 1): void {
    this.factureService.annee(boutiqueId, undefined, page, this.perPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data.factures;
          this.factures = data.factures.data;
          this.resume = data.resume;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  rechercher(search: string): void {
    this.loading = true;
    this.cdr.markForCheck();

    const boutiqueId = this.selectedBoutique?.id;

    this.factureService.search(search, boutiqueId, this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.paginationData = data;
          this.factures = data.data;
          this.resume = null;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // 🎯 FILTRES
  // ─────────────────────────────────────────────────────────────
  changerFiltre(filtre: FiltrePeriode): void {
    this.filtrePeriode = filtre;
    this.currentPage = 1;
    this.searchControl.setValue('', { emitEvent: false });
    this.loadFactures();
  }

  // ─────────────────────────────────────────────────────────────
  // 📄 PAGINATION
  // ─────────────────────────────────────────────────────────────
  goToPage(page: number): void {
    if (page < 1 || !this.paginationData) return;
    if (page > this.paginationData.last_page) return;
    this.loadFactures(page);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.paginationData && this.currentPage < this.paginationData.last_page) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getStatutClass(statut: string): string {
    return statut === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }

  trackById = (_: number, item: Facture) => item.id;
}
