import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LivreurService, Livreur, UpdateLivreurPayload } from '../../../core/services/livreur.service';

@Component({
  selector: 'app-livreur-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './livreur-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivreurEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  livreur: Livreur | null = null;
  livreurId!: number;
  showScrollTop = false;

  constructor(
    private fb: FormBuilder,
    private livreurService: LivreurService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.livreurId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadLivreur();
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
      disponible: [true],
      actif: [true],
    });
  }

  loadLivreur(): void {
    this.loadingData = true;
    this.cdr.markForCheck();

    this.livreurService.getById(this.livreurId).subscribe({
      next: (response) => {
        this.livreur = response.livreur;
        this.form.patchValue({
          nom: response.livreur.nom,
          telephone: response.livreur.telephone,
          disponible: response.livreur.disponible,
          actif: response.livreur.actif,
        });
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Livreur introuvable';
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
    if (this.form.invalid || !this.livreur) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: UpdateLivreurPayload = {
      nom: this.form.value.nom,
      telephone: this.form.value.telephone,
      disponible: this.form.value.disponible,
      actif: this.form.value.actif,
    };

    this.livreurService.update(this.livreur.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Livreur modifié avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/livreurs']);
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
