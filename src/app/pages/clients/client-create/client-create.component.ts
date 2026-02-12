import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientService, CreateClientPayload } from '../../../core/services/client.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-create.component.html',
})
export class ClientCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom_complet: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateClientPayload = this.form.value;

    // Admin peut spécifier boutique_id
    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    this.clientService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Client créé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création client:', err);
        this.errorMessage = err.error?.errors?.telephone?.[0] || err.error?.message || 'Erreur lors de la création';
        this.loading = false;
        this.autoHideError();
      },
    });
  }

  private autoHideError(): void {
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }
}
