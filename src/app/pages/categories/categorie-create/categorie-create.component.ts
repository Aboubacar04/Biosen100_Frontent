import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategorieService } from '../../../core/services/categorie.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { Boutique } from '../../../core/models/boutique.model'; // ✅ IMPORT DEPUIS MODEL
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-categorie-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './categorie-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategorieCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categorieForm!: FormGroup;
  loading = false;
  errorMessage = '';

  // Admin : sélecteur boutique
  isAdmin = false;
  boutiques: Boutique[] = [];
  selectedBoutiqueId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private categorieService: CategorieService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkIfAdmin();
    this.listenBoutiqueChange();
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

  private checkIfAdmin(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'admin';

    if (this.isAdmin) {
      this.loadBoutiques();
    } else {
      const boutique = this.boutiqueService.getSelectedBoutique();
      this.selectedBoutiqueId = boutique?.id || null;
    }
    this.cdr.markForCheck();
  }

  private loadBoutiques(): void {
    this.boutiqueService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (boutiques) => {
          this.boutiques = boutiques;
          const selected = this.boutiqueService.getSelectedBoutique();
          this.selectedBoutiqueId = selected?.id || (boutiques.length > 0 ? boutiques[0].id : null);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erreur chargement boutiques:', err),
      });
  }

  private listenBoutiqueChange(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe(boutique => {
        this.selectedBoutiqueId = boutique?.id || null;
        this.cdr.markForCheck();
      });
  }

  onBoutiqueChange(boutiqueId: number): void {
    this.selectedBoutiqueId = boutiqueId;
    const boutique = this.boutiques.find(b => b.id === boutiqueId);
    if (boutique) {
      this.boutiqueService.selectBoutique(boutique); // ✅ MÉTHODE CORRECTE
    }
  }

  onSubmit(): void {
    if (this.categorieForm.invalid) {
      this.categorieForm.markAllAsTouched();
      return;
    }

    if (this.isAdmin && !this.selectedBoutiqueId) {
      this.errorMessage = 'Veuillez sélectionner une boutique';
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    const payload: any = {
      ...this.categorieForm.value,
    };

    if (this.isAdmin && this.selectedBoutiqueId) {
      payload.boutique_id = this.selectedBoutiqueId;
    }

    this.categorieService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/categories']);
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
