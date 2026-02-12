import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandeService, CreateCommandePayload } from '../../../core/services/commande.service';
import { AuthService } from '../../../core/services/auth.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { ClientService, Client } from '../../../core/services/client.service';
import { ProduitService, Produit } from '../../../core/services/produit.service';
import { EmployeService, Employe } from '../../../core/services/employe.service';
import { LivreurService, Livreur } from '../../../core/services/livreur.service';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACE PANIER
// ═══════════════════════════════════════════════════════════════
interface ProduitPanier {
  produit: Produit;
  quantite: number;
  sousTotal: number;
}

@Component({
  selector: 'app-commande-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './commande-create.component.html',
})
export class CommandeCreateComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Données
  clientRecherche = '';
  clientTrouve: Client | null = null;
  clientLoading = false;
  clientSuggestions: Client[] = [];
  showClientSuggestions = false;

  produitRecherche = '';
  produitsFiltres: Produit[] = [];
  tousLesProduits: Produit[] = [];
  produitsLoading = false;

  employes: Employe[] = [];
  livreurs: Livreur[] = [];

  panier: ProduitPanier[] = [];
  total = 0;

  // Modals
  showClientModal = false;
  showProduitSelector = false;
  newClientForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private clientService: ClientService,
    private produitService: ProduitService,
    private employeService: EmployeService,
    private livreurService: LivreurService,
    private authService: AuthService,
    private boutiqueService: BoutiqueService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEmployes();
    this.loadLivreurs();
    this.loadProduits();
  }

  initForm(): void {
    this.form = this.fb.group({
      client_id: [null],
      employe_id: [null, Validators.required],
      livreur_id: [null],
      type_commande: ['sur_place', Validators.required],
      notes: [''],
    });

    this.newClientForm = this.fb.group({
      nom_complet: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: [''],
    });

    // Watch type_commande pour livreur obligatoire si livraison
    this.form.get('type_commande')?.valueChanges.subscribe((type) => {
      if (type === 'livraison') {
        this.form.get('livreur_id')?.setValidators(Validators.required);
      } else {
        this.form.get('livreur_id')?.clearValidators();
      }
      this.form.get('livreur_id')?.updateValueAndValidity();
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 AUTOCOMPLETE CLIENT (tape pour voir suggestions)
  // ─────────────────────────────────────────────────────────────
  onClientInput(): void {
    const query = this.clientRecherche.trim();

    if (query.length < 2) {
      this.clientSuggestions = [];
      this.showClientSuggestions = false;
      return;
    }

    const boutique = this.boutiqueService.getSelectedBoutique();

    this.clientService.autocomplete(query, boutique?.id).subscribe({
      next: (clients) => {
        this.clientSuggestions = clients;
        this.showClientSuggestions = clients.length > 0;
      },
      error: (err) => {
        console.error('Erreur autocomplete:', err);
      },
    });
  }

  selectClient(client: Client): void {
    this.clientTrouve = client;
    this.clientRecherche = client.telephone;
    this.form.patchValue({ client_id: client.id });
    this.clientSuggestions = [];
    this.showClientSuggestions = false;
    this.errorMessage = '';
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 RECHERCHE CLIENT PAR TÉLÉPHONE (bouton rechercher)
  // ─────────────────────────────────────────────────────────────
  rechercherClient(): void {
    const telephone = this.clientRecherche.trim();

    // Validation format téléphone : minimum 8 chiffres
    if (!telephone) {
      this.errorMessage = 'Veuillez saisir un numéro de téléphone';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    // Accepte format: +221XXXXXXXXX, 221XXXXXXXXX, ou 77777777 (min 8 chiffres)
    if (!/^\+?\d+$/.test(telephone)) {
      this.errorMessage = 'Le numéro doit contenir uniquement des chiffres (avec ou sans +)';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    // Minimum 8 chiffres (sans compter le +)
    const chiffresOnly = telephone.replace('+', '');
    if (chiffresOnly.length < 8) {
      this.errorMessage = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    this.clientLoading = true;
    this.clientTrouve = null;
    this.errorMessage = '';
    this.clientSuggestions = [];
    this.showClientSuggestions = false;
    const boutique = this.boutiqueService.getSelectedBoutique();

    this.clientService.searchByPhone(telephone, boutique?.id).subscribe({
      next: (client) => {
        this.clientTrouve = client;
        this.form.patchValue({ client_id: client.id });
        this.clientLoading = false;
      },
      error: (err) => {
        console.error('Erreur recherche client:', err);
        this.clientLoading = false;

        if (err.status === 404) {
          // Client non trouvé
          this.errorMessage = '';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la recherche';
          setTimeout(() => { this.errorMessage = ''; }, 5000);
        }
      },
    });
  }

  creerNouveauClient(): void {
    if (this.newClientForm.invalid) return;

    const telephone = this.newClientForm.value.telephone.trim();

    // Validation format téléphone (accepte +)
    if (!/^\+?\d+$/.test(telephone)) {
      alert('Le numéro doit contenir uniquement des chiffres (avec ou sans +)');
      return;
    }

    // Minimum 8 chiffres (sans compter le +)
    const chiffresOnly = telephone.replace('+', '');
    if (chiffresOnly.length < 8) {
      alert('Le numéro de téléphone doit contenir au moins 8 chiffres');
      return;
    }

    const payload: any = this.newClientForm.value;

    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    this.clientService.create(payload).subscribe({
      next: (response) => {
        this.clientTrouve = response.client;
        this.form.patchValue({ client_id: response.client.id });
        this.showClientModal = false;
        this.newClientForm.reset();
      },
      error: (err) => {
        console.error('Erreur création client:', err);
        const message = err.error?.errors?.telephone?.[0] || err.error?.message || 'Erreur lors de la création du client';
        alert(message);
      },
    });
  }

  retirerClient(): void {
    this.clientTrouve = null;
    this.clientRecherche = '';
    this.form.patchValue({ client_id: null });
  }

  // ─────────────────────────────────────────────────────────────
  // 🛒 GESTION DES PRODUITS
  // ─────────────────────────────────────────────────────────────
  loadProduits(): void {
    this.produitsLoading = true;
    const boutique = this.boutiqueService.getSelectedBoutique();

    const filters: any = { actif: true, per_page: 1000 };
    if (boutique) {
      filters.boutique_id = boutique.id;
    }

    this.produitService.getAll(filters).subscribe({
      next: (response) => {
        this.tousLesProduits = response.data;
        this.produitsFiltres = [...this.tousLesProduits];
        this.produitsLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.produitsLoading = false;
      },
    });
  }

  filtrerProduits(): void {
    if (!this.produitRecherche.trim()) {
      this.produitsFiltres = [...this.tousLesProduits];
    } else {
      this.produitsFiltres = this.tousLesProduits.filter((p) =>
        p.nom.toLowerCase().includes(this.produitRecherche.toLowerCase())
      );
    }
  }

  ajouterProduit(produit: Produit): void {
    const existe = this.panier.find((item) => item.produit.id === produit.id);

    if (existe) {
      existe.quantite++;
      existe.sousTotal = existe.quantite * parseFloat(produit.prix_vente);
    } else {
      this.panier.push({
        produit,
        quantite: 1,
        sousTotal: parseFloat(produit.prix_vente),
      });
    }

    this.calculerTotal();
    this.showProduitSelector = false;
    this.produitRecherche = '';
    this.produitsFiltres = [...this.tousLesProduits];
  }

  modifierQuantite(item: ProduitPanier, delta: number): void {
    item.quantite += delta;

    if (item.quantite <= 0) {
      this.retirerProduit(item);
    } else {
      item.sousTotal = item.quantite * parseFloat(item.produit.prix_vente);
      this.calculerTotal();
    }
  }

  retirerProduit(item: ProduitPanier): void {
    this.panier = this.panier.filter((p) => p.produit.id !== item.produit.id);
    this.calculerTotal();
  }

  calculerTotal(): void {
    this.total = this.panier.reduce((sum, item) => sum + item.sousTotal, 0);
  }

  // ─────────────────────────────────────────────────────────────
  // 👤 CHARGEMENT EMPLOYÉS / LIVREURS
  // ─────────────────────────────────────────────────────────────
  loadEmployes(): void {
    const boutique = this.boutiqueService.getSelectedBoutique();
    const filters: any = { actif: true };
    if (boutique) {
      filters.boutique_id = boutique.id;
    }

    this.employeService.getAll(filters).subscribe({
      next: (employes) => {
        this.employes = employes;
      },
      error: (err) => {
        console.error('Erreur chargement employés:', err);
      },
    });
  }

  loadLivreurs(): void {
    const boutique = this.boutiqueService.getSelectedBoutique();
    const boutiqueId = boutique?.id;

    this.livreurService.getDisponibles(boutiqueId).subscribe({
      next: (livreurs) => {
        this.livreurs = livreurs;
      },
      error: (err) => {
        console.error('Erreur chargement livreurs:', err);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ SOUMETTRE LA COMMANDE
  // ─────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid || this.panier.length === 0) {
      this.errorMessage = 'Veuillez remplir tous les champs et ajouter au moins un produit.';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateCommandePayload = {
      ...this.form.value,
      produits: this.panier.map((item) => ({
        produit_id: item.produit.id,
        quantite: item.quantite,
      })),
    };

    if (this.authService.isAdmin()) {
      const selectedBoutique = this.boutiqueService.getSelectedBoutique();
      if (selectedBoutique) {
        payload.boutique_id = selectedBoutique.id;
      }
    }

    this.commandeService.create(payload).subscribe({
      next: (response) => {
        console.log('Commande créée:', response);
        this.successMessage = 'Commande créée avec succès !';
        setTimeout(() => {
          this.router.navigate(['/commandes']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création commande:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création de la commande';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  getImageUrl(image: string | null): string {
    if (!image) return '/assets/default-product.png';
    return `http://localhost:8000/storage/${image}`;
  }
}
