import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { Boutique } from '../../../core/models/boutique.model';

@Component({
  selector: 'app-boutique-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './boutique-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutiqueEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  boutiqueId!: number;
  boutique: Boutique | null = null;
  boutiqueForm!: FormGroup;
  loading = false;
  errorMessage = '';

  // Upload logo
  selectedFile: File | null = null;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.boutiqueId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadBoutique();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.boutiqueForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(255)]],
      adresse: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.maxLength(20)]],
    });
  }

  private loadBoutique(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.boutiqueService.getById(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boutique) => {
          this.boutique = boutique;
          this.boutiqueForm.patchValue({
            nom: boutique.nom,
            adresse: boutique.adresse,
            telephone: boutique.telephone,
          });

          if (boutique.logo) {
            this.logoPreview = this.boutiqueService.getLogoUrl(boutique.logo);
          }

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement boutique:', err);
          this.errorMessage = 'Erreur lors du chargement';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.boutiqueForm.invalid) {
      this.boutiqueForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const formData = new FormData();
    formData.append('nom', this.boutiqueForm.value.nom);
    formData.append('adresse', this.boutiqueForm.value.adresse);
    formData.append('telephone', this.boutiqueForm.value.telephone);

    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    }

    this.boutiqueService.update(this.boutiqueId, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/boutiques']);
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
