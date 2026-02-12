import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DepenseService, CreateDepensePayload } from '../../../core/services/depense.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-depense-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './depense-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepenseCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

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
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.errorMessage = '';
        this.cdr.markForCheck();
      }, 5000);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: CreateDepensePayload = {
      description: this.form.value.description,
      montant: +this.form.value.montant,
      categorie: this.form.value.categorie,
      date_depense: this.form.value.date_depense,
    };

    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    this.depenseService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Dépense créée avec succès !';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/depenses']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur création dépense:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
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
