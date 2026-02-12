import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DepenseService, Depense, UpdateDepensePayload } from '../../../core/services/depense.service';

@Component({
  selector: 'app-depense-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './depense-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepenseEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  depense: Depense | null = null;

  categories = [
    'Loyer',
    'Salaires',
    'Électricité',
    'Eau',
    'Téléphone/Internet',
    'Fournitures',
    'Transport',
    'Entretien',
    'Autre'
  ];

  constructor(
    private fb: FormBuilder,
    private depenseService: DepenseService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      description: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0)]],
      categorie: ['', Validators.required],
      date_depense: ['', Validators.required],
    });

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

    this.loadingData = true;
    this.cdr.markForCheck();

    this.depenseService.getById(+id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (depense) => {
          this.depense = depense;
          this.form.patchValue({
            description: depense.description,
            montant: depense.montant,
            categorie: depense.categorie,
            date_depense: depense.date_depense.split('T')[0], // Format YYYY-MM-DD
          });
          this.loadingData = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = 'Dépense introuvable';
          this.loadingData = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.markForCheck();
          }, 5000);
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.depense) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: UpdateDepensePayload = {
      description: this.form.value.description,
      montant: +this.form.value.montant,
      categorie: this.form.value.categorie,
      date_depense: this.form.value.date_depense,
    };

    this.depenseService.update(this.depense.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Dépense modifiée avec succès !';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/depenses']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.markForCheck();
          setTimeout(() => {
            this.errorMessage = '';
            this.cdr.markForCheck();
          }, 5000);
        },
      });
  }
}
