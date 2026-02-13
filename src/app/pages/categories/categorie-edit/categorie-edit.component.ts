import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategorieService, Categorie } from '../../../core/services/categorie.service';

@Component({
  selector: 'app-categorie-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categorie-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategorieEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categorieId!: number;
  categorie: Categorie | null = null;
  categorieForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categorieId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCategorie();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
    });
  }

  private loadCategorie(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.categorieService.getById(this.categorieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categorie) => {
          this.categorie = categorie;
          this.categorieForm.patchValue({
            nom: categorie.nom,
            description: categorie.description || '',
          });
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement catégorie:', err);
          this.errorMessage = 'Erreur lors du chargement de la catégorie';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onSubmit(): void {
    if (this.categorieForm.invalid) {
      this.categorieForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const payload = this.categorieForm.value;

    this.categorieService.update(this.categorieId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
        },
        error: (err) => {
          console.error('Erreur modification:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la modification';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
