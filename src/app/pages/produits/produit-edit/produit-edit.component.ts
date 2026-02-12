import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ProduitService, Produit, UpdateProduitPayload, Categorie } from '../../../core/services/produit.service';
import { HttpClient } from '@angular/common/http';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-produit-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './produit-edit.component.html',
})
export class ProduitEditComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  produit: Produit | null = null;
  imagePreview: string | null = null;
  selectedImage: File | null = null;
  categories: Categorie[] = [];
  loadingCategories = false;

  constructor(
    private fb: FormBuilder,
    private produitService: ProduitService,
    private boutiqueService: BoutiqueService,
    private route: ActivatedRoute,
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
      actif: [true],
    });

    this.loadCategories();
    this.loadProduit();
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

  loadProduit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/produits']);
      return;
    }

    this.loadingData = true;
    this.produitService.getById(+id).subscribe({
      next: (produit) => {
        this.produit = produit;
        this.form.patchValue({
          nom: produit.nom,
          description: produit.description,
          prix_vente: produit.prix_vente,
          stock: produit.stock,
          seuil_alerte: produit.seuil_alerte,
          categorie_id: produit.categorie_id,
          actif: produit.actif,
        });
        if (produit.image) {
          this.imagePreview = `http://localhost:8000/storage/${produit.image}`;
        }
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.errorMessage = 'Produit introuvable';
        this.loadingData = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
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
    if (this.form.invalid || !this.produit) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: UpdateProduitPayload = {
      nom: this.form.value.nom,
      description: this.form.value.description,
      prix_vente: +this.form.value.prix_vente,
      stock: +this.form.value.stock,
      seuil_alerte: +this.form.value.seuil_alerte,
      categorie_id: +this.form.value.categorie_id,
      actif: this.form.value.actif,
    };

    if (this.selectedImage) {
      payload.image = this.selectedImage;
    }

    this.produitService.update(this.produit.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Produit modifié avec succès !';
        setTimeout(() => {
          this.router.navigate(['/produits']);
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
