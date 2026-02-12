import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ClientService, CreateClientPayload } from '../../../core/services/client.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  boutiqueId: number | null = null;
  showScrollTop = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
      nom_complet: ['', [Validators.required, Validators.minLength(3)]],
      telephone: ['', [Validators.required, Validators.minLength(8)]],
      adresse: [''],
    });
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

    const payload: CreateClientPayload = {
      nom_complet: this.form.value.nom_complet,
      telephone: this.form.value.telephone,
      adresse: this.form.value.adresse || undefined,
    };

    if (this.authService.isAdmin() && this.boutiqueId) {
      payload.boutique_id = this.boutiqueId;
    }

    this.clientService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Client créé avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création client:', err);
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
