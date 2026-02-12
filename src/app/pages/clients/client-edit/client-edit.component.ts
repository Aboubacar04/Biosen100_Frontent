import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ClientService, Client, UpdateClientPayload } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientEditComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── États ────────────────────────────────────────────────
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  client: Client | null = null;
  clientId!: number;
  showScrollTop = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.clientId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadClient();
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
      email: ['', [Validators.email]],           // ✅ AJOUTÉ
      adresse: [''],
      actif: [true],                             // ✅ AJOUTÉ
    });
  }

  loadClient(): void {
    this.loadingData = true;
    this.cdr.markForCheck();

    this.clientService.getById(this.clientId).subscribe({
      next: (response) => {                      // ✅ response au lieu de client
        // ✅ Extraire le client de ClientDetailResponse
        this.client = response.client;
        this.form.patchValue({
          nom_complet: response.client.nom_complet,
          telephone: response.client.telephone,
          email: response.client.email,          // ✅ AJOUTÉ
          adresse: response.client.adresse,
          actif: response.client.actif,          // ✅ AJOUTÉ
        });
        this.loadingData = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Client introuvable';
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
    if (this.form.invalid || !this.client) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    const payload: UpdateClientPayload = {
      nom_complet: this.form.value.nom_complet,
      telephone: this.form.value.telephone,
      email: this.form.value.email || undefined,       // ✅ AJOUTÉ
      adresse: this.form.value.adresse || undefined,
      actif: this.form.value.actif,                    // ✅ AJOUTÉ
    };

    this.clientService.update(this.client.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Client modifié avec succès !';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.router.navigate(['/clients']);
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
