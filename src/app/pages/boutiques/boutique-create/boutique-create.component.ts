import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-boutique-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './boutique-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoutiqueCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  boutiqueForm!: FormGroup;
  loading = false;
  errorMessage = '';

  // Upload logo
  selectedFile: File | null = null;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private boutiqueService: BoutiqueService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
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

    this.boutiqueService.create(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/boutiques']);
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }
}
