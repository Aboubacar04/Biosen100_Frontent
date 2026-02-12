import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommandeService, HistoriqueResponse, Commande } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-today',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-today.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE
})
export class CommandeTodayComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>(); // ✅ CLEANUP

  commandes: Commande[] = [];
  pagination: any = null;
  resume: any = null;
  loading = false;

  selectedDate: string = '';

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef // ✅ MANUAL DETECTION
  ) {
    // Date du jour par défaut
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadHistorique();
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
        this.loadHistorique();
      });
  }

  loadHistorique(): void {
    this.loading = true;
    this.cdr.markForCheck();

    const params: any = {};
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.commandeService.getHistorique(this.selectedDate, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: HistoriqueResponse) => {
          this.resume = response.resume;
          this.commandes = response.commandes.data;
          this.pagination = response.commandes;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement historique:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onDateChange(): void {
    this.loadHistorique();
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'validee':
        return 'bg-green-100 text-green-700';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-700';
      case 'annulee':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'validee':
        return 'Validée';
      case 'en_cours':
        return 'En cours';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  }

  // ✅ TRACKBY FUNCTION
  trackByCommandeId = (_: number, commande: Commande) => commande.id;
}
