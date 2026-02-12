import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import {
  LivreurService,
  Livreur,
  LivreurStatistiques,
  CommandeResume,
  LivreurDetailResponse
} from '../../../core/services/livreur.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-livreur-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './livreur-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivreurDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  boutiqueId: number | null = null;
  livreurId!: number;
  loading = true;
  errorMessage = '';

  // ─── Données (TOUT VIENT DU BACKEND) ──────────────────────
  livreur: Livreur | null = null;
  stats: LivreurStatistiques = {
    total_livraisons: 0,
    montant_total_livre: 0,
    livraison_moyenne: 0,
    derniere_livraison: null,
    livraisons_validees: 0,
    livraisons_en_cours: 0,
    livraisons_annulees: 0,
  };
  commandes: CommandeResume[] = [];

  // ─── Pagination commandes ─────────────────────────────────
  commandesPage = 1;
  commandesPerPage = 5;

  // ─── Scroll to top ────────────────────────────────────────
  showScrollTop = false;

  constructor(
    private livreurService: LivreurService,
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.livreurId = +this.route.snapshot.paramMap.get('id')!;

    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.loadLivreur();
      });

    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  // ═══════════════════════════════════════════════════════════
  // CHARGEMENT DONNÉES (1 SEUL APPEL API)
  // ═══════════════════════════════════════════════════════════
  loadLivreur(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.livreurService.getById(this.livreurId).subscribe({
      next: (response: LivreurDetailResponse) => {
        this.livreur = response.livreur;
        this.stats = response.statistiques;
        this.commandes = response.commandes;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement livreur:', err);
        this.errorMessage = 'Livreur introuvable';
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

  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
