import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  ClientService,
  Client,
  ClientStatistiques,
  CommandeResume,
  ClientDetailResponse
} from '../../../core/services/client.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  boutiqueId: number | null = null;
  clientId!: number;
  loading = true;
  errorMessage = '';

  // ─── Données (TOUT VIENT DU BACKEND) ──────────────────────
  client: Client | null = null;
  stats: ClientStatistiques = {
    total_commandes: 0,
    total_depense: 0,
    commande_moyenne: 0,
    derniere_commande: null,
    commandes_validees: 0,
    commandes_en_cours: 0,
    commandes_annulees: 0,
  };
  commandes: CommandeResume[] = [];

  // ─── Pagination commandes ─────────────────────────────────
  commandesPage = 1;
  commandesPerPage = 5;

  // ─── Scroll to top ────────────────────────────────────────
  showScrollTop = false;

  constructor(
    private clientService: ClientService,
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clientId = +this.route.snapshot.paramMap.get('id')!;

    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.loadClient();
      });

    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  // ═══════════════════════════════════════════════════════════
  // CHARGEMENT DONNÉES (SIMPLE - 1 SEUL APPEL API)
  // ═══════════════════════════════════════════════════════════
  loadClient(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.clientService.getById(this.clientId).subscribe({
      next: (response: ClientDetailResponse) => {
        this.client = response.client;
        this.stats = response.statistiques;
        this.commandes = response.commandes;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement client:', err);
        this.errorMessage = 'Client introuvable';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PAGINATION COMMANDES
  // ═══════════════════════════════════════════════════════════
  get commandesPagine(): CommandeResume[] {
    const start = (this.commandesPage - 1) * this.commandesPerPage;
    return this.commandes.slice(start, start + this.commandesPerPage);
  }

  get commandesTotalPages(): number {
    return Math.ceil(this.commandes.length / this.commandesPerPage);
  }

  get commandesPages(): number[] {
    return Array.from({ length: this.commandesTotalPages }, (_, i) => i + 1);
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
  trackById(_: number, item: CommandeResume): number {
    return item.id;
  }

  trackByPage(_: number, page: number): number {
    return page;
  }

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════
  f(value: number | string): string {
    return Number(value).toLocaleString('fr-FR') + ' F';
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'validee': return 'bg-green-100 text-green-700';
      case 'annulee': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'validee': return 'Validée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }
}
