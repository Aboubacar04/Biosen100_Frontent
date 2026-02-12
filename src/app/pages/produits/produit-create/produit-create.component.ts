import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProduitService, CreateProduitPayload, Categorie } from '../../../core/services/produit.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-produit-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produit-create.component.html',
})
export class ProduitCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  imagePreview: string | null = null;
  selectedImage: File | null = null;
  categories: Categorie[] = [];
  loadingCategories = false;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      description: [''],
      prix_vente: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      seuil_alerte: ['', [Validators.required, Validators.min(0)]],
      categorie_id: ['', Validators.required],
    });

    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    const boutique = this.boutiqueService.getSelectedBoutique();
    const boutiqueId = boutique?.id;

    this.http.get<Categorie[]>(`http://localhost:8000/api/categories`, {
      params: boutiqueId ? { boutique_id: boutiqueId.toString() } : {}
    }).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
      },
      error: (err) => {
        console.error('Erreur chargement catégories:', err);
        this.loadingCategories = false;
      },
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
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

    const payload: CreateProduitPayload = {
      nom: this.form.value.nom,
      description: this.form.value.description,
      prix_vente: +this.form.value.prix_vente,
      stock: +this.form.value.stock,
      seuil_alerte: +this.form.value.seuil_alerte,
      categorie_id: +this.form.value.categorie_id,
    };

    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    if (this.selectedImage) {
      payload.image = this.selectedImage;
    }

    this.produitService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Produit créé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/produits']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création produit:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
