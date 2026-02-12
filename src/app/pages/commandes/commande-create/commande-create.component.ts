import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './commande-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ PERFORMANCE BOOST
})
export class CommandeCreateComponent implements OnInit, OnDestroy {
  // ✅ PERFORMANCE: Cleanup automatique des subscriptions
  private destroy$ = new Subject<void>();
  private clientSearchSubject$ = new Subject<string>();
  private produitSearchSubject$ = new Subject<string>();

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
    private router: Router,
    private cdr: ChangeDetectorRef // ✅ PERFORMANCE: Change detection manuelle
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupSearchDebounce(); // ✅ PERFORMANCE: Debounced search
    this.loadEmployes();
    this.loadLivreurs();
    this.loadProduits();
  }

  ngOnDestroy(): void {
    // ✅ PERFORMANCE: Cleanup pour éviter memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ PERFORMANCE: Setup debounced search (300ms)
  // ═══════════════════════════════════════════════════════════════
  private setupSearchDebounce(): void {
    // Client search avec 300ms debounce
    this.clientSearchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performClientSearch(query);
      });

    // Produit search avec 300ms debounce
    this.produitSearchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.performProduitFilter(query);
      });
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

    // Watch type_commande avec cleanup
    this.form.get('type_commande')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        if (type === 'livraison') {
          this.form.get('livreur_id')?.setValidators(Validators.required);
        } else {
          this.form.get('livreur_id')?.clearValidators();
        }
        this.form.get('livreur_id')?.updateValueAndValidity();
        this.cdr.markForCheck();
      });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 AUTOCOMPLETE CLIENT (avec debounce optimisé)
  // ─────────────────────────────────────────────────────────────
  onClientInput(): void {
    this.clientSearchSubject$.next(this.clientRecherche.trim());
  }

  private performClientSearch(query: string): void {
    if (query.length < 2) {
      this.clientSuggestions = [];
      this.showClientSuggestions = false;
      this.cdr.markForCheck();
      return;
    }

    const boutique = this.boutiqueService.getSelectedBoutique();

    this.clientService.autocomplete(query, boutique?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (clients) => {
          this.clientSuggestions = clients;
          this.showClientSuggestions = clients.length > 0;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur autocomplete:', err);
          this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  rechercherClient(): void {
    const telephone = this.clientRecherche.trim();

    if (!telephone) {
      this.errorMessage = 'Veuillez saisir un numéro de téléphone';
      this.autoHideMessage('error');
      return;
    }

    if (!/^\+?\d+$/.test(telephone)) {
      this.errorMessage = 'Le numéro doit contenir uniquement des chiffres (avec ou sans +)';
      this.autoHideMessage('error');
      return;
    }

    const chiffresOnly = telephone.replace('+', '');
    if (chiffresOnly.length < 8) {
      this.errorMessage = 'Le numéro de téléphone doit contenir au moins 8 chiffres';
      this.autoHideMessage('error');
      return;
    }

    this.clientLoading = true;
    this.clientTrouve = null;
    this.errorMessage = '';
    this.clientSuggestions = [];
    this.showClientSuggestions = false;
    this.cdr.markForCheck();

    const boutique = this.boutiqueService.getSelectedBoutique();

    this.clientService.searchByPhone(telephone, boutique?.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (client) => {
          this.clientTrouve = client;
          this.form.patchValue({ client_id: client.id });
          this.clientLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur recherche client:', err);
          this.clientLoading = false;

          if (err.status !== 404) {
            this.errorMessage = err.error?.message || 'Erreur lors de la recherche';
            this.autoHideMessage('error');
          }
          this.cdr.markForCheck();
        },
      });
  }

  creerNouveauClient(): void {
    if (this.newClientForm.invalid) return;

    const telephone = this.newClientForm.value.telephone.trim();

    if (!/^\+?\d+$/.test(telephone)) {
      alert('Le numéro doit contenir uniquement des chiffres (avec ou sans +)');
      return;
    }

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

    this.clientService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.clientTrouve = response.client;
          this.form.patchValue({ client_id: response.client.id });
          this.showClientModal = false;
          this.newClientForm.reset();
          this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  // ─────────────────────────────────────────────────────────────
  // 🛒 GESTION DES PRODUITS (avec debounce optimisé)
  // ─────────────────────────────────────────────────────────────
  loadProduits(): void {
    this.produitsLoading = true;
    this.cdr.markForCheck();

    const boutique = this.boutiqueService.getSelectedBoutique();
    const filters: any = { actif: true, per_page: 1000 };
    if (boutique) {
      filters.boutique_id = boutique.id;
    }

    this.produitService.getAll(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.tousLesProduits = response.data;
          this.produitsFiltres = [...this.tousLesProduits];
          this.produitsLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement produits:', err);
          this.produitsLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  filtrerProduits(): void {
    this.produitSearchSubject$.next(this.produitRecherche);
  }

  private performProduitFilter(query: string): void {
    if (!query.trim()) {
      this.produitsFiltres = [...this.tousLesProduits];
    } else {
      const lowerQuery = query.toLowerCase();
      this.produitsFiltres = this.tousLesProduits.filter((p) =>
        p.nom.toLowerCase().includes(lowerQuery)
      );
    }
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }

  modifierQuantite(item: ProduitPanier, delta: number): void {
    item.quantite += delta;

    if (item.quantite <= 0) {
      this.retirerProduit(item);
    } else {
      item.sousTotal = item.quantite * parseFloat(item.produit.prix_vente);
      this.calculerTotal();
    }
    this.cdr.markForCheck();
  }

  retirerProduit(item: ProduitPanier): void {
    this.panier = this.panier.filter((p) => p.produit.id !== item.produit.id);
    this.calculerTotal();
    this.cdr.markForCheck();
  }

  calculerTotal(): void {
    this.total = this.panier.reduce((sum, item) => sum + item.sousTotal, 0);
  }

  // ─────────────────────────────────────────────────────────────
  // 👤 CHARGEMENT EMPLOYÉS / LIVREURS
  // ─────────────────────────────────────────────────────────────
  loadEmployes(): void {
    const boutique = this.boutiqueService.getSelectedBoutique();
    const filters: any = { actif: true, per_page: 100 };
    if (boutique) {
      filters.boutique_id = boutique.id;
    }

    this.employeService.getAll(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.employes = response.data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur chargement employés:', err);
        },
      });
  }

  loadLivreurs(): void {
    const boutique = this.boutiqueService.getSelectedBoutique();
    const boutiqueId = boutique?.id;

    this.livreurService.getDisponibles(boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (livreurs) => {
          this.livreurs = livreurs;
          this.cdr.markForCheck();
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
      this.autoHideMessage('error');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

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

    this.commandeService.create(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Commande créée:', response);
          this.successMessage = 'Commande créée avec succès !';
          this.cdr.markForCheck();
          setTimeout(() => {
            this.router.navigate(['/commandes/today']);
          }, 1500);
        },
        error: (err) => {
          console.error('Erreur création commande:', err);
          this.errorMessage = err.error?.message || 'Erreur lors de la création de la commande';
          this.loading = false;
          this.autoHideMessage('error');
          this.cdr.markForCheck();
        },
      });
  }

  // ─────────────────────────────────────────────────────────────
  // 🛠️ HELPERS
  // ─────────────────────────────────────────────────────────────
  private autoHideMessage(type: 'success' | 'error'): void {
    setTimeout(() => {
      if (type === 'success') {
        this.successMessage = '';
      } else {
        this.errorMessage = '';
      }
      this.cdr.markForCheck();
    }, 5000);
  }

  getImageUrl(image: string | null): string {
    if (!image) return '/assets/default-product.png';
    return `http://localhost:8000/storage/${image}`;
  }

  // ✅ PERFORMANCE: TrackBy functions pour ngFor
  trackByClientId = (_: number, client: Client) => client.id;
  trackByEmployeId = (_: number, employe: Employe) => employe.id;
  trackByLivreurId = (_: number, livreur: Livreur) => livreur.id;
  trackByProduitId = (_: number, produit: Produit) => produit.id;
  trackByPanierId = (_: number, item: ProduitPanier) => item.produit.id;
}
