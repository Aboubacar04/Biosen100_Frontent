import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FactureService, Facture } from '../../../core/services/facture.service';

@Component({
  selector: 'app-facture-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './facture-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FactureDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  facture: Facture | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private factureService: FactureService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFacture();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFacture(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.factureService.getById(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (facture) => {
          this.facture = facture;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement facture:', err);
          this.errorMessage = 'Facture introuvable';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  imprimerFacture(): void {
    window.print();
  }

  getStatutClass(statut: string): string {
    return statut === 'active'
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }

  getStatutLabel(statut: string): string {
    return statut === 'active' ? 'Active' : 'Annulée';
  }
}
