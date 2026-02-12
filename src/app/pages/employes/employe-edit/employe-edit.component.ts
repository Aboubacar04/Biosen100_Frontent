import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { EmployeService, Employe, UpdateEmployePayload } from '../../../core/services/employe.service';

@Component({
  selector: 'app-employe-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employe-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  employe: Employe | null = null;
  employeId!: number;
  showScrollTop = false;

  // ─── Upload photo ─────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.employeId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadEmploye();
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  // ═══════════════════════════════════════════════════════════
  // FORMULAIRE
  // ═══════════════════════════════════════════════════════════
  initForm(): void {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['', [Validators.required, Validators.minLength(8)]],
      actif: [true],
    });
  }

  loadEmploye(): void {
    this.loadingData = true;
    this.cdr.markForCheck();

    this.employeService.getById(this.employeId).subscribe({
      next: (response) => {
        this.employe = response.employe;
        this.form.patchValue({
          nom: response.employe.nom,
          telephone: response.employe.telephone,
          actif: response.employe.actif,
        });
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Employé introuvable';
        this.loadingData = false;
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // UPLOAD PHOTO
  // ═══════════════════════════════════════════════════════════
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validation type
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Le fichier doit être une image';
        this.autoHideMessage('error');
        return;
      }

      // Validation taille (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'L\'image ne doit pas dépasser 2MB';
        this.autoHideMessage('error');
        return;
      }

      this.selectedFile = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  removeNewPhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════
  // SOUMISSION
  // ═══════════════════════════════════════════════════════════
  onSubmit(): void {
    if (this.form.invalid || !this.employe) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: UpdateEmployePayload = {
      nom: this.form.value.nom,
      telephone: this.form.value.telephone,
      actif: this.form.value.actif,
      photo: this.selectedFile || undefined,
    };

    this.employeService.update(this.employe.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Employé modifié avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/employes']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.loading = false;
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════════════════════
  autoHideMessage(type: 'success' | 'error'): void {
    setTimeout(() => {
      if (type === 'success') {
        this.successMessage = '';
      } else {
        this.errorMessage = '';
      }
      this.cdr.markForCheck();
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════
  // SCROLL TO TOP
  // ═══════════════════════════════════════════════════════════
  onScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
    this.cdr.markForCheck();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
