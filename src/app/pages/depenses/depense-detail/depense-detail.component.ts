import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DepenseService, Depense } from '../../../core/services/depense.service';

@Component({
  selector: 'app-depense-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './depense-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepenseDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  depense: Depense | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private depenseService: DepenseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepense();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepense(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/depenses']);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.depenseService.getById(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (depense) => {
          this.depense = depense;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement dépense:', err);
          this.errorMessage = 'Dépense introuvable';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  getCategorieColor(categorie: string): string {
    const colors: { [key: string]: string } = {
      'Loyer': 'bg-blue-100 text-blue-700 border-blue-200',
      'Salaires': 'bg-green-100 text-green-700 border-green-200',
      'Électricité': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Eau': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'Téléphone/Internet': 'bg-purple-100 text-purple-700 border-purple-200',
      'Fournitures': 'bg-pink-100 text-pink-700 border-pink-200',
      'Transport': 'bg-orange-100 text-orange-700 border-orange-200',
      'Entretien': 'bg-red-100 text-red-700 border-red-200',
      'Autre': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[categorie] || 'bg-gray-100 text-gray-700 border-gray-200';
  }
}
