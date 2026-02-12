import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
  ViewChild, ElementRef
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { Chart, registerables, TooltipItem, ScriptableContext } from 'chart.js';

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

  // ─── Canvas refs ──────────────────────────────────────────
  @ViewChild('evolutionCanvas') evolutionCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('semaineCanvas')   semaineCanvasRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('stockChart') stockChartRef!: ElementRef<HTMLCanvasElement>;


  private evolutionChart!: Chart;
  private semaineChart!:   Chart;
  private stockChart!: Chart;


  readonly STORAGE = 'http://localhost:8000/storage/';

  // ─── États ────────────────────────────────────────────────
  isAdmin           = false;
  boutiqueId: number | null = null;
  loadingPriority   = true;
  loadingSecondary  = true;

  // ─── Filtres tops ─────────────────────────────────────────
  periodeTop: Periode = 'mois';
  limiteTop           = 5;
  readonly periodes: { value: Periode; label: string }[] = [
    { value: 'jour',    label: "Aujourd'hui" },
    { value: 'semaine', label: 'Semaine'      },
    { value: 'mois',    label: 'Mois'         },
    { value: 'annee',   label: 'Année'        },
  ];
  readonly limites = [5, 10, 20];

  // ─── Données ─────────────────────────────────────────────
  stats!: DashboardStats;
  evolutionVentes: EvolutionVente[] = [];
  commandesSemaine: CommandeJour[]  = [];
  topProduits: TopProduit[]         = [];
  topEmployes: TopEmploye[]         = [];
  topLivreurs: TopLivreur[]         = [];
  stockFaible: StockFaible[]        = [];

  // ─── Pagination stock ─────────────────────────────────────
  stockPage    = 1;
  stockPerPage = 8;
  get stockPagine(): StockFaible[] {
    const s = (this.stockPage - 1) * this.stockPerPage;
    return this.stockFaible.slice(s, s + this.stockPerPage);
  }
  get stockTotalPages(): number { return Math.ceil(this.stockFaible.length / this.stockPerPage); }
  get stockPages(): number[]    { return Array.from({ length: this.stockTotalPages }, (_, i) => i + 1); }

  // ─── Getters calculés ─────────────────────────────────────
  get totalVentes7j(): number {
    return this.evolutionVentes.reduce((s, e) => s + Number(e.ventes), 0);
  }
  get totalCmds7j(): number {
    return this.evolutionVentes.reduce((s, e) => s + Number(e.nombre_commandes), 0);
  }
  get panierMoyen7j(): number {
    return this.totalCmds7j > 0 ? Math.round(this.totalVentes7j / this.totalCmds7j) : 0;
  }
  get meilleurJour(): EvolutionVente | null {
    if (!this.evolutionVentes.length) return null;
    const avec = this.evolutionVentes.filter(e => Number(e.ventes) > 0);
    if (!avec.length) return null;
    return avec.reduce((best, cur) => Number(cur.ventes) > Number(best.ventes) ? cur : best);
  }
  get joursActifsSemaine(): number {
    return this.commandesSemaine.filter(c => c.nombre_commandes > 0).length;
  }
  get totalVentesSemaine(): number {
    return this.commandesSemaine.reduce((s, c) => s + Number(c.total_ventes), 0);
  }
  get totalCmdsSemaine(): number {
    return this.commandesSemaine.reduce((s, c) => s + c.nombre_commandes, 0);
  }
  get moyenneCmdsSemaine(): number {
    return this.joursActifsSemaine > 0
      ? Math.round(this.totalCmdsSemaine / this.joursActifsSemaine)
      : 0;
  }
  get tendanceVentes(): 'hausse' | 'baisse' | 'stable' {
    if (this.evolutionVentes.length < 2) return 'stable';
    const recent = this.evolutionVentes.slice(-3).filter(e => Number(e.ventes) > 0);
    const ancien = this.evolutionVentes.slice(0, 3).filter(e => Number(e.ventes) > 0);
    if (!recent.length || !ancien.length) return 'stable';
    const avgRecent = recent.reduce((s, e) => s + Number(e.ventes), 0) / recent.length;
    const avgAncien = ancien.reduce((s, e) => s + Number(e.ventes), 0) / ancien.length;
    if (avgRecent > avgAncien * 1.05)  return 'hausse';
    if (avgRecent < avgAncien * 0.95)  return 'baisse';
    return 'stable';
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
    this.evolutionChart?.destroy();
    this.semaineChart?.destroy();
    this.destroy$.next();
    this.destroy$.complete();
    this.stockChart?.destroy();

  }

  // ─── Vague 1 ─────────────────────────────────────────────
  loadPriority(): void {
    this.loadingPriority  = true;
    this.loadingSecondary = true;
    this.cdr.markForCheck();

    forkJoin({
      stats:            this.dashboardService.getStats(this.boutiqueId),
      evolutionVentes:  this.dashboardService.getEvolutionVentes(this.boutiqueId),
      commandesSemaine: this.dashboardService.getCommandesSemaine(this.boutiqueId),
    }).subscribe({
      next: (d) => {
        this.stats            = d.stats;
        this.evolutionVentes  = d.evolutionVentes;
        this.commandesSemaine = d.commandesSemaine;
        this.loadingPriority  = false;
        this.cdr.markForCheck();
        setTimeout(() => { this.buildEvolutionChart(); this.buildSemaineChart(); }, 80);
        this.loadSecondary();
      },
      error: () => { this.loadingPriority = false; this.cdr.markForCheck(); }
    });
  }

  // ─── Vague 2 ─────────────────────────────────────────────
  loadSecondary(): void {
    forkJoin({
      topProduits: this.dashboardService.getTopProduits(this.periodeTop, this.limiteTop, this.boutiqueId),
      topEmployes: this.dashboardService.getTopEmployes(this.periodeTop, this.limiteTop, this.boutiqueId),
      topLivreurs: this.dashboardService.getTopLivreurs(this.periodeTop, this.limiteTop, this.boutiqueId),
      stockFaible: this.dashboardService.getStockFaible(this.boutiqueId),
    }).subscribe({
      next: (d) => {
        this.topProduits      = d.topProduits;
        this.topEmployes      = d.topEmployes;
        this.topLivreurs      = d.topLivreurs;
        this.stockFaible      = d.stockFaible;
        this.stockPage        = 1;
        this.loadingSecondary = false;
        this.cdr.markForCheck();
        setTimeout(() => this.buildStockChart(), 80);

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
      next: (d) => {
        this.topProduits      = d.topProduits;
        this.topEmployes      = d.topEmployes;
        this.topLivreurs      = d.topLivreurs;
        this.loadingSecondary = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingSecondary = false; this.cdr.markForCheck(); }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GRAPHIQUE 1 — ÉVOLUTION 7 JOURS (HERO, PLEINE LARGEUR)
  // Courbe épaisse + barres commandes + double axe dynamique
  // ═══════════════════════════════════════════════════════════
  buildEvolutionChart(): void {
    if (!this.evolutionCanvasRef?.nativeElement) return;
    this.evolutionChart?.destroy();

    const labels    = this.evolutionVentes.map(e =>
      new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })
    );
    const ventes    = this.evolutionVentes.map(e => Number(e.ventes));
    const commandes = this.evolutionVentes.map(e => Number(e.nombre_commandes));

    // max dynamiques — Chart.js adapte automatiquement les échelles
    const maxIdx = ventes.indexOf(Math.max(...ventes));

    this.evolutionChart = new Chart(this.evolutionCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          // ── Barres commandes (fond)
          {
            type:  'bar' as any,
            label: 'Commandes',
            data:  commandes,
            backgroundColor: commandes.map(v =>
              v > 0 ? 'rgba(74,222,128,0.20)' : 'rgba(255,255,255,0.05)'
            ),
            hoverBackgroundColor: 'rgba(74,222,128,0.35)',
            borderColor: commandes.map(v =>
              v > 0 ? 'rgba(74,222,128,0.50)' : 'transparent'
            ),
            borderWidth:   1,
            borderRadius:  5,
            borderSkipped: false,
            yAxisID: 'y1',
            order:   2,
          },
          // ── Courbe ventes (premier plan)
          {
            type:  'line' as any,
            label: 'Ventes (FCFA)',
            data:  ventes,
            fill:  true,
            backgroundColor: (ctx: any) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
              g.addColorStop(0,   'rgba(74,222,128,0.40)');
              g.addColorStop(0.6, 'rgba(74,222,128,0.08)');
              g.addColorStop(1,   'rgba(74,222,128,0.00)');
              return g;
            },
            borderColor:               '#4ade80',
            borderWidth:               4,           // ← ligne très épaisse
            pointBackgroundColor: ventes.map((_, i) =>
              i === maxIdx ? '#f59e0b' : '#4ade80'  // ← meilleur jour = or
            ),
            pointBorderColor:          '#0f2419',
            pointBorderWidth:          2,
            pointRadius:               6,           // ← points gros
            pointHoverRadius:          13,
            pointHoverBackgroundColor: '#fbbf24',
            tension:                   0.1,
            yAxisID: 'y',
            order:   1,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutCubic' as any },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display:  true,
            position: 'top',
            align:    'end',
            labels: {
              boxWidth:     14,
              boxHeight:    14,
              borderRadius: 6,
              padding:      20,
              color:        'rgba(255,255,255,0.80)',
              font: { size: 13, weight: 'bold' as any },
            },
          },
          tooltip: {
            backgroundColor:  'rgba(0,0,0,0.85)',
            titleColor:       'rgba(255,255,255,0.60)',
            bodyColor:        '#ffffff',
            borderColor:      '#4ade80',
            borderWidth:      1,
            padding:          16,
            cornerRadius:     12,
            callbacks: {
              title:  (items: TooltipItem<'bar'>[]) => `📅 ${items[0].label}`,
              label:  (ctx: TooltipItem<'bar'>) => {
                if (ctx.dataset.label === 'Ventes (FCFA)')
                  return `  💰 ${Number(ctx.raw).toLocaleString('fr-FR')} FCFA`;
                return `  📦 ${ctx.raw} commande(s)`;
              },
              footer: (items: TooltipItem<'bar'>[]) => {
                const v = items.find((i: TooltipItem<'bar'>) => i.dataset.label === 'Ventes (FCFA)');
                const c = items.find((i: TooltipItem<'bar'>) => i.dataset.label === 'Commandes');
                if (!v || !c || !Number(c.raw)) return '';
                const avg = Math.round(Number(v.raw) / Number(c.raw));
                return `  🛒 Panier moyen : ${avg.toLocaleString('fr-FR')} FCFA`;
              },
            },
          },
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks: {
              color: 'rgba(255,255,255,0.75)',
              font:  { size: 13, weight: 'bold' as any },
              padding: 8,
            },
          },
          y: {
            type:        'linear',
            position:    'left',
            beginAtZero: true,   // ← 0-based, pas de hardcode max
            grid:        { color: 'rgba(255,255,255,0.06)', drawTicks: false },
            border:      { display: false },
            ticks: {
              color:   'rgba(255,255,255,0.55)',
              font:    { size: 12 },
              padding: 12,
              callback: (v: number | string) => {
                const n = Number(v);
                if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
                if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'k';
                return n.toString();
              },
            },
          },
          y1: {
            type:        'linear',
            position:    'right',
            beginAtZero: true,   // ← dynamique
            grid:        { drawOnChartArea: false },
            border:      { display: false },
            ticks: {
              stepSize: 1,
              color:    'rgba(255,255,255,0.35)',
              font:     { size: 11 },
              padding:  10,
              callback: (v: number | string) => `${v} cmd`,
            },
          },
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // GRAPHIQUE 2 — COMMANDES SEMAINE (barres + ligne)
  // 100% dynamique : échelles calculées sur les données réelles
  // ═══════════════════════════════════════════════════════════
  buildSemaineChart(): void {
    if (!this.semaineCanvasRef?.nativeElement) return;
    this.semaineChart?.destroy();

    const labels    = this.commandesSemaine.map(c => c.jour);
    const commandes = this.commandesSemaine.map(c => c.nombre_commandes);
    const ventes    = this.commandesSemaine.map(c => Number(c.total_ventes));

    this.semaineChart = new Chart(this.semaineCanvasRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [
         // Barres commandes
{
  type:  'bar' as any,
  label: 'Commandes',
  data:  commandes,
  backgroundColor: (ctx: ScriptableContext<'bar'>) => {
    const max = Math.max(...commandes, 1);
    const ratio = commandes[ctx.dataIndex] / max;
    const alpha = 0.3 + ratio * 0.7;
    return `rgba(21,128,61,${alpha.toFixed(2)})`;
  },
  hoverBackgroundColor: '#166534',
  borderRadius: 0,        // ❌ plus d’arrondi
  borderSkipped: false,
  yAxisID: 'y1',
  order: 2,
},

// Ligne ventes
{
  type:  'line' as any,
  label: 'Ventes (FCFA)',
  data:  ventes,
  fill:  false,
  borderColor: '#f59e0b',
  borderWidth: 3.5,
  borderDash: [8, 4],
  pointBackgroundColor: ventes.map(v => v > 0 ? '#f59e0b' : 'transparent'),
  pointBorderColor: '#ffffff',
  pointBorderWidth: 2,
  pointRadius: ventes.map(v => v > 0 ? 4 : 0),  // 🔽 plus petits
  pointHoverRadius: 6,                          // 🔽 hover réduit
  tension: 0.3,
  yAxisID: 'y',
  order: 1,
}

        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' as any },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display:  true,
            position: 'top',
            align:    'end',
            labels: {
              boxWidth:     14,
              boxHeight:    14,
              borderRadius: 6,
              padding:      16,
              color:        '#374151',
              font: { size: 13, weight: 'bold' as any },
            },
          },
          tooltip: {
            backgroundColor:  '#111827',
            titleColor:       '#9ca3af',
            bodyColor:        '#f9fafb',
            borderColor:      '#374151',
            borderWidth:      1,
            padding:          14,
            cornerRadius:     12,
            callbacks: {
              label: (ctx: TooltipItem<'bar'>) => {
                if (ctx.dataset.label === 'Ventes (FCFA)')
                  return `  💰 ${Number(ctx.raw).toLocaleString('fr-FR')} FCFA`;
                return `  📦 ${ctx.raw} commande(s)`;
              },
            },
          },
        },
        scales: {
          x: {
            grid:   { display: false },
            border: { display: false },
            ticks: {
              color: '#374151',
              font:  { size: 14, weight: 'bold' as any },
              padding: 8,
            },
          },
          y: {
            type:        'linear',
            position:    'left',
            beginAtZero: true,   // ← dynamique
            grid:        { color: '#f3f4f6', drawTicks: false },
            border:      { display: false },
            ticks: {
              color:   '#9ca3af',
              font:    { size: 12 },
              padding: 10,
              callback: (v: number | string) => {
                const n = Number(v);
                if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k F';
                return n + ' F';
              },
            },
          },
          y1: {
            type:        'linear',
            position:    'right',
            beginAtZero: true,   // ← dynamique — s'adapte si 90 commandes/jour
            grid:        { drawOnChartArea: false },
            border:      { display: false },
            ticks: {
              stepSize: 1,
              color:    '#9ca3af',
              font:     { size: 12 },
              padding:  10,
              callback: (v: number | string) => `${v} cmd`,
            },
          },
        },
      },
    });
  }

  // ─── TrackBy ─────────────────────────────────────────────
  trackById(_: number, item: any):       number { return item.id;         }
  trackByIndex(i: number):               number { return i;               }
  trackByEmployeId(_: number, e: any):   number { return e.employe_id;    }
  trackByLivreurId(_: number, l: any):   number { return l.livreur_id;    }
  trackByPage(_: number, p: number):     number { return p;               }

  // ─── Utilitaires ──────────────────────────────────────────
  f(v: number | string): string {
    return Number(v).toLocaleString('fr-FR') + ' F';
  }
  fCourt(v: number | string): string {
    const n = Number(v);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M F';
    if (n >= 1_000)     return Math.round(n / 1_000) + 'k F';
    return n + ' F';
  }
  initiales(nom: string): string {
    return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
  photoUrl(path: string | null): string | null {
    return path ? this.STORAGE + path : null;
  }
  imgUrl(path: string | null): string | null {
    return path ? this.STORAGE + path : null;
  }
  stockBadge(p: StockFaible): { label: string; cls: string; dot: string } {
    if (p.stock <= 0)
      return { label: 'Rupture',  cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    };
    if (p.stock <= Math.floor(p.seuil_alerte / 2))
      return { label: 'Critique', cls: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' };
    return   { label: 'Faible',   cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' };
  }
  medal(i: number): string {
    return ['🥇','🥈','🥉'][i] ?? `#${i+1}`;
  }








// ═══════════════════════════════════════════════════════════
// GRAPHIQUE 3 — STOCK FAIBLE (barres horizontales)
// Montre les produits les plus proches de la rupture
// ═══════════════════════════════════════════════════════════
buildStockChart(): void {
  if (!this.stockChartRef?.nativeElement) return;
  this.stockChart?.destroy();

  const produits = this.stockFaible.slice(0, 6); // max 6 produits pour rester lisible

  const labels = produits.map(p =>
    p.nom.length > 14 ? p.nom.slice(0, 14) + '…' : p.nom
  );

  const stocks = produits.map(p => p.stock);

  this.stockChart = new Chart(this.stockChartRef.nativeElement, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Stock restant',
          data: stocks,
          borderRadius: 6,
          backgroundColor: stocks.map(v =>
            v <= 0 ? '#ef4444' :      // rouge = rupture
            v <= 5 ? '#f97316' :      // orange = critique
            '#eab308'                 // jaune = faible
          ),
        }
      ]
    },
    options: {
      indexAxis: 'y', // ← barres horizontales
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Stock: ${ctx.raw}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#9ca3af', font: { size: 11 } },
          grid: { color: '#f3f4f6' }
        },
        y: {
          ticks: { color: '#374151', font: { size: 11, weight: 'bold' as any } },
          grid: { display: false }
        }
      }
    }
  });
}



}
