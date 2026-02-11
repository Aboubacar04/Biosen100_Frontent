import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';

import { BoutiqueService } from '../../core/services/boutique.service';
import { AuthService }     from '../../core/services/auth.service';
import {
  DashboardService, DashboardStats, EvolutionVente,
  CommandeJour, TopProduit, TopEmploye, TopLivreur,
  StockFaible, Periode
} from '../../core/services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild('ventesChart')    ventesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('commandesChart') commandesChartRef!: ElementRef<HTMLCanvasElement>;

  private ventesChartInstance!: Chart;
  private commandesChartInstance!: Chart;

  // ── État ─────────────────────────────────────────────────
  isAdmin          = false;
  boutiqueId: number | null = null;
  loadingPriority  = true;
  loadingSecondary = true;

  // ── Filtres ───────────────────────────────────────────────
  periodeTop: Periode = 'mois';
  limiteTop           = 5;

  readonly periodes: { value: Periode; label: string }[] = [
    { value: 'jour',    label: "Aujourd'hui" },
    { value: 'semaine', label: 'Semaine'      },
    { value: 'mois',    label: 'Mois'         },
    { value: 'annee',   label: 'Année'        },
  ];
  readonly limites = [5, 10, 20];

  // ── Données ──────────────────────────────────────────────
  stats!: DashboardStats;
  evolutionVentes: EvolutionVente[] = [];
  commandesSemaine: CommandeJour[]  = [];
  topProduits: TopProduit[]         = [];
  topEmployes: TopEmploye[]         = [];
  topLivreurs: TopLivreur[]         = [];
  stockFaible: StockFaible[]        = [];

  // ── Pagination stock ─────────────────────────────────────
  stockPage    = 1;
  stockPerPage = 8;

  get stockPagine(): StockFaible[] {
    const s = (this.stockPage - 1) * this.stockPerPage;
    return this.stockFaible.slice(s, s + this.stockPerPage);
  }
  get stockTotalPages(): number {
    return Math.ceil(this.stockFaible.length / this.stockPerPage);
  }
  get stockPages(): number[] {
    return Array.from({ length: this.stockTotalPages }, (_, i) => i + 1);
  }

  get totalVentesSemaine(): string {
    const t = this.commandesSemaine.reduce((s, c) => s + Number(c.total_ventes), 0);
    return this.formatMontant(t);
  }
  get totalCmdsSemaine(): number {
    return this.commandesSemaine.reduce((s, c) => s + c.nombre_commandes, 0);
  }

  get totalVentesEvolution(): string {
    const t = this.evolutionVentes.reduce((s, e) => s + Number(e.ventes), 0);
    return this.formatMontant(t);
  }

  constructor(
    private dashboardService: DashboardService,
    private boutiqueService:  BoutiqueService,
    private authService:      AuthService,
    private cdr:              ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.loadPriority();
      });
  }

  ngOnDestroy(): void {
    this.ventesChartInstance?.destroy();
    this.commandesChartInstance?.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── VAGUE 1 ──────────────────────────────────────────────
  loadPriority(): void {
    this.loadingPriority  = true;
    this.loadingSecondary = true;
    this.cdr.markForCheck();

    forkJoin({
      stats:            this.dashboardService.getStats(this.boutiqueId),
      evolutionVentes:  this.dashboardService.getEvolutionVentes(this.boutiqueId),
      commandesSemaine: this.dashboardService.getCommandesSemaine(this.boutiqueId),
    }).subscribe({
      next: (data) => {
        this.stats            = data.stats;
        this.evolutionVentes  = data.evolutionVentes;
        this.commandesSemaine = data.commandesSemaine;
        this.loadingPriority  = false;
        this.cdr.markForCheck();
        setTimeout(() => this.buildCharts(), 50);
        this.loadSecondary();
      },
      error: () => { this.loadingPriority = false; this.cdr.markForCheck(); }
    });
  }

  // ── VAGUE 2 ──────────────────────────────────────────────
  loadSecondary(): void {
    forkJoin({
      topProduits: this.dashboardService.getTopProduits(this.periodeTop, this.limiteTop, this.boutiqueId),
      topEmployes: this.dashboardService.getTopEmployes(this.periodeTop, this.limiteTop, this.boutiqueId),
      topLivreurs: this.dashboardService.getTopLivreurs(this.periodeTop, this.limiteTop, this.boutiqueId),
      stockFaible: this.dashboardService.getStockFaible(this.boutiqueId),
    }).subscribe({
      next: (data) => {
        this.topProduits      = data.topProduits;
        this.topEmployes      = data.topEmployes;
        this.topLivreurs      = data.topLivreurs;
        this.stockFaible      = data.stockFaible;
        this.stockPage        = 1;
        this.loadingSecondary = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingSecondary = false; this.cdr.markForCheck(); }
    });
  }

  loadTops(): void {
    this.loadingSecondary = true;
    this.cdr.markForCheck();
    forkJoin({
      topProduits: this.dashboardService.getTopProduits(this.periodeTop, this.limiteTop, this.boutiqueId),
      topEmployes: this.dashboardService.getTopEmployes(this.periodeTop, this.limiteTop, this.boutiqueId),
      topLivreurs: this.dashboardService.getTopLivreurs(this.periodeTop, this.limiteTop, this.boutiqueId),
    }).subscribe({
      next: (data) => {
        this.topProduits      = data.topProduits;
        this.topEmployes      = data.topEmployes;
        this.topLivreurs      = data.topLivreurs;
        this.loadingSecondary = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingSecondary = false; this.cdr.markForCheck(); }
    });
  }

  // ── Chart.js ─────────────────────────────────────────────
  buildCharts(): void {
    this.buildVentesChart();
    this.buildCommandesChart();
  }

  private buildVentesChart(): void {
    if (!this.ventesChartRef?.nativeElement) return;
    this.ventesChartInstance?.destroy();

    const labels = this.evolutionVentes.map(e =>
      new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    );
    const data = this.evolutionVentes.map(e => Number(e.ventes));

    this.ventesChartInstance = new Chart(this.ventesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Ventes',
          data,
          fill: true,
          backgroundColor: 'rgba(21,128,61,0.07)',
          borderColor: '#15803D',
          borderWidth: 2.5,
          pointBackgroundColor: '#15803D',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#15803D',
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#9ca3af',
            bodyColor: '#f9fafb',
            borderColor: '#1f2937',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => `  ${Number(ctx.raw).toLocaleString('fr-FR')} F`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } },
          },
          y: {
            grid: { color: '#f3f4f6', drawTicks: false },
            border: { display: false, dash: [4, 4] },
            ticks: {
              color: '#9ca3af',
              font: { size: 11 },
              padding: 8,
              callback: (v) => {
                const n = Number(v);
                return n >= 1000 ? (n / 1000).toFixed(0) + 'k F' : n + ' F';
              },
            },
          },
        },
      },
    });
  }

  private buildCommandesChart(): void {
    if (!this.commandesChartRef?.nativeElement) return;
    this.commandesChartInstance?.destroy();

    const labels = this.commandesSemaine.map(c => c.jour.slice(0, 3));
    const data   = this.commandesSemaine.map(c => c.nombre_commandes);
    const colors = data.map(v => v > 0 ? '#15803D' : '#e5e7eb');
    const hover  = data.map(v => v > 0 ? '#166534' : '#d1d5db');

    this.commandesChartInstance = new Chart(this.commandesChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Commandes',
          data,
          backgroundColor: colors,
          hoverBackgroundColor: hover,
          borderRadius: 8,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#9ca3af',
            bodyColor: '#f9fafb',
            borderColor: '#1f2937',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: (ctx) => `  ${ctx.raw} commande(s)`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: '#9ca3af', font: { size: 11 } },
          },
          y: {
            grid: { color: '#f3f4f6', drawTicks: false },
            border: { display: false },
            beginAtZero: true,
            ticks: {
              color: '#9ca3af',
              font: { size: 11 },
              padding: 8,
              stepSize: 1,
            },
          },
        },
      },
    });
  }

  // ── TrackBy ──────────────────────────────────────────────
  trackById(_: number, item: any): number        { return item.id;         }
  trackByIndex(index: number): number             { return index;           }
  trackByEmployeId(_: number, item: any): number  { return item.employe_id; }
  trackByLivreurId(_: number, item: any): number  { return item.livreur_id; }
  trackByPage(_: number, page: number): number    { return page;            }

  // ── Utilitaires ──────────────────────────────────────────
  formatMontant(v: number | string): string {
    return Number(v).toLocaleString('fr-FR') + ' F';
  }

  getInitiales(nom: string): string {
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  stockBadge(p: StockFaible): { label: string; bg: string; dot: string } {
    if (p.stock <= 0)
      return { label: 'Rupture',  bg: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    };
    if (p.stock <= Math.floor(p.seuil_alerte / 2))
      return { label: 'Critique', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' };
    return   { label: 'Faible',   bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' };
  }

  medalEmoji(i: number): string {
    return ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`;
  }
}
