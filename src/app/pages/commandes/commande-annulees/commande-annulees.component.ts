import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommandeService, PaginatedCommandes, Commande } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-annulees',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-annulees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class CommandeAnnuleesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP

  commandes: Commande[] = [];
  pagination: any = null;
  loading = false;

  filters = {
    per_page: 15,
    page: 1,
  };

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
    this.listenBoutiqueChange(); // ✅ ÉCOUTE CHANGEMENT BOUTIQUE
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
        this.loadCommandes();
      });
  }

  loadCommandes(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = { ...this.filters };
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.commandeService.getAnnulees(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedCommandes) => {
          this.commandes = response.data;
          this.pagination = response;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement commandes annulées:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadCommandes();
  }

  // ✅ TRACKBY FUNCTION
  trackByCommandeId = (_: number, commande: Commande) => commande.id;
}
