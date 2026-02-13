import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { CommandeService, Commande, PaginatedCommandes } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandeListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  boutiqueId: number | null = null;
  loading = false;
  commandes: Commande[] = [];
  pagination: any = null;

  filters = {
    page: 1,
    per_page: 15,
    search: ''
  };

  searchQuery = '';
  selectedDate = '';
  successMessage = '';
  errorMessage = '';

  showAnnulerModal = false;
  commandeToAnnuler: Commande | null = null;
  raisonAnnulation = '';
  annulerLoading = false;

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.loadCommandes();
      });

    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        this.filters.search = search;
        this.filters.page = 1;
        this.loadCommandes();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCommandes(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = {
      boutique_id: this.boutiqueId || undefined,
      per_page: this.filters.per_page,
      page: this.filters.page
    };

    // Ajouter le filtre date si sélectionné
    if (this.selectedDate) {
      params.date = this.selectedDate;
    }

    if (this.filters.search) {
      this.commandeService.search(this.filters.search, params).subscribe({
        next: (response: PaginatedCommandes) => {
          this.commandes = response.data;
          this.pagination = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = 'Erreur lors de la recherche';
          this.loading = false;
          this.cdr.markForCheck();
          this.autoHideMessage('error');
        },
      });
    } else {
      this.commandeService.getAll(params).subscribe({
        next: (response: PaginatedCommandes) => {
          this.commandes = response.data;
          this.pagination = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = 'Erreur lors du chargement';
          this.loading = false;
          this.cdr.markForCheck();
          this.autoHideMessage('error');
        },
      });
    }
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchQuery);
  }

  onDateChange(): void {
    this.filters.page = 1;
    this.loadCommandes();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDate = '';
    this.filters.search = '';
    this.filters.page = 1;
    this.loadCommandes();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadCommandes();
  }

  openAnnulerModal(commande: Commande): void {
    this.commandeToAnnuler = commande;
    this.showAnnulerModal = true;
    this.raisonAnnulation = '';
    this.cdr.markForCheck();
  }

  confirmAnnuler(): void {
    if (!this.commandeToAnnuler || !this.raisonAnnulation.trim()) return;

    this.annulerLoading = true;
    this.cdr.markForCheck();

    this.commandeService.annuler(this.commandeToAnnuler.id, this.raisonAnnulation).subscribe({
      next: () => {
        this.successMessage = 'Commande annulée avec succès';
        this.showAnnulerModal = false;
        this.annulerLoading = false;
        this.loadCommandes();
        this.autoHideMessage('success');
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de l\'annulation';
        this.annulerLoading = false;
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

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

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'bg-blue-100 text-blue-700';
      case 'validee':
        return 'bg-green-100 text-green-700';
      case 'annulee':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_cours':
        return 'En cours';
      case 'validee':
        return 'Validée';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  }
}
