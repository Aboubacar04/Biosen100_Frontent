import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LivreurService, CreateLivreurPayload } from '../../../core/services/livreur.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-livreur-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './livreur-create.component.html',
})
export class LivreurCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private livreurService: LivreurService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateLivreurPayload = this.form.value;

    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    this.livreurService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Livreur créé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/livreurs']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création livreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
