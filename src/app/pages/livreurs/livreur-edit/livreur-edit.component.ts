import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { LivreurService, Livreur, UpdateLivreurPayload } from '../../../core/services/livreur.service';

@Component({
  selector: 'app-livreur-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './livreur-edit.component.html',
})
export class LivreurEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  livreur: Livreur | null = null;

  constructor(
    private fb: FormBuilder,
    private livreurService: LivreurService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
      disponible: [true],
      actif: [true],
    });

    this.loadLivreur();
  }

  loadLivreur(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/livreurs']);
      return;
    }

    this.loadingData = true;
    this.livreurService.getById(+id).subscribe({
      next: (livreur) => {
        this.livreur = livreur;
        this.form.patchValue({
          nom: livreur.nom,
          telephone: livreur.telephone,
          disponible: livreur.disponible,
          actif: livreur.actif,
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Livreur introuvable';
        this.loadingData = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.livreur) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateLivreurPayload = this.form.value;

    this.livreurService.update(this.livreur.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Livreur modifié avec succès !';
        setTimeout(() => {
          this.router.navigate(['/livreurs']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
