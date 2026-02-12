import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LivreurService, CreateLivreurPayload } from '../../../core/services/livreur.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-livreur-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './livreur-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivreurCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  boutiqueId: number | null = null;
  isAdmin = false;
  showScrollTop = false;

  constructor(
    private fb: FormBuilder,
    private livreurService: LivreurService,
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

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: CreateLivreurPayload = {
      nom: this.form.value.nom,
      telephone: this.form.value.telephone,
      boutique_id: this.isAdmin ? this.boutiqueId ?? undefined : undefined,
    };

    this.livreurService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Livreur créé avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/livreurs']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur:', err);
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
