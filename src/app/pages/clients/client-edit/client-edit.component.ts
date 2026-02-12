import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ClientService, Client, UpdateClientPayload } from '../../../core/services/client.service';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-edit.component.html',
})
export class ClientEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  client: Client | null = null;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom_complet: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: [''],
    });

    this.loadClient();
  }

  loadClient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/clients']);
      return;
    }

    this.loadingData = true;
    this.clientService.getById(+id).subscribe({
      next: (client) => {
        this.client = client;
        this.form.patchValue({
          nom_complet: client.nom_complet,
          telephone: client.telephone,
          adresse: client.adresse,
        });
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Erreur chargement client:', err);
        this.errorMessage = 'Client introuvable';
        this.loadingData = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.client) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateClientPayload = this.form.value;

    this.clientService.update(this.client.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Client modifié avec succès !';
        setTimeout(() => {
          this.router.navigate(['/clients']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur modification client:', err);
        this.errorMessage = err.error?.errors?.telephone?.[0] || err.error?.message || 'Erreur lors de la modification';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
