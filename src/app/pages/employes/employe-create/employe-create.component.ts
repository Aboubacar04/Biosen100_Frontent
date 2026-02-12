import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { EmployeService, CreateEmployePayload } from '../../../core/services/employe.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employe-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employe-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  boutiqueId: number | null = null;
  isAdmin = false;
  showScrollTop = false;

  // ─── Upload photo ─────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.initForm();

    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.boutiqueId = boutique?.id ?? null;
        this.cdr.markForCheck();
      });

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

  removePhoto(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════
  // SOUMISSION
  // ═══════════════════════════════════════════════════════════
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: CreateEmployePayload = {
      nom: this.form.value.nom,
      telephone: this.form.value.telephone,
      photo: this.selectedFile || undefined,
      boutique_id: this.isAdmin ? this.boutiqueId ?? undefined : undefined,
    };

    this.employeService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Employé créé avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/employes']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
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
