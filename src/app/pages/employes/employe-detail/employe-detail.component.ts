import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  EmployeService,
  Employe,
  EmployeStatistiques,
  CommandeResume,
  EmployeDetailResponse,
} from '../../../core/services/employe.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
@Component({
  selector: 'app-employe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employe-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  boutiqueId: number | null = null;
  employeId!: number;
  loading = true;
  errorMessage = '';
  employe: Employe | null = null;
  stats: EmployeStatistiques = {
    total_commandes: 0,
    total_ventes: 0,
    vente_moyenne: 0,
    derniere_commande: null,
    commandes_validees: 0,
    commandes_en_cours: 0,
    commandes_annulees: 0,
    ventes_jour: 0,
    ventes_mois: 0,
  };
  commandes: CommandeResume[] = [];
  commandesPage = 1;
  commandesPerPage = 5;
  showScrollTop = false;
  constructor(
    private employeService: EmployeService,
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.employeId = +this.route.snapshot.paramMap.get('id')!;
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe((boutique) => {
        this.boutiqueId = boutique?.id ?? null;
        this.loadEmploye();
      });
    window.addEventListener('scroll', this.onScroll.bind(this));
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }
  loadEmploye(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.employeService.getById(this.employeId).subscribe({
      next: (response: EmployeDetailResponse) => {
        this.employe = response.employe;
        this.stats = response.statistiques;
        this.commandes = response.commandes;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Employé introuvable';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
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
  onScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
    this.cdr.markForCheck();
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  trackById(_: number, item: CommandeResume): number {
    return item.id;
  }
  trackByPage(_: number, page: number): number {
    return page;
  }
  f(value: number | string): string {
    return Number(value).toLocaleString('fr-FR') + ' F';
  }
  getStatutClass(statut: string): string {
    return statut === 'en_cours'
      ? 'bg-blue-100 text-blue-700'
      : statut === 'validee'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';
  }
  getStatutLabel(statut: string): string {
    return statut === 'en_cours'
      ? 'En cours'
      : statut === 'validee'
        ? 'Validée'
        : 'Annulée';
  }
  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
