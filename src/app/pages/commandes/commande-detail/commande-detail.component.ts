import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommandeService, Commande, ValiderCommandeResponse } from '../../../core/services/commande.service';

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './commande-detail.component.html',
})
export class CommandeDetailComponent implements OnInit {
  commande: Commande | null = null;
  loading = false;
  successMessage = '';
  errorMessage = '';

  // Actions
  showAnnulationModal = false;
  showValidationModal = false;
  showFactureModal = false;
  annulationForm!: FormGroup;

  validationLoading = false;
  annulationLoading = false;
  factureData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadCommande();
  }

  initForms(): void {
    this.annulationForm = this.fb.group({
      raison: ['', Validators.required],
    });
  }

  loadCommande(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading = true;
    this.commandeService.getById(+id).subscribe({
      next: (commande) => {
        this.commande = commande;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commande:', err);
        this.errorMessage = 'Commande introuvable';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ VALIDER LA COMMANDE
  // ─────────────────────────────────────────────────────────────
  ouvrirModalValidation(): void {
    this.showValidationModal = true;
  }

  validerCommande(): void {
    if (!this.commande) return;

    this.validationLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.commandeService.valider(this.commande.id).subscribe({
      next: (response: ValiderCommandeResponse) => {
        this.factureData = response.impression;
        this.showValidationModal = false;
        this.showFactureModal = true;
        this.validationLoading = false;
        this.successMessage = 'Commande validée avec succès !';
        this.loadCommande(); // Recharger pour voir le statut validé
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur validation:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la validation';
        this.validationLoading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ❌ ANNULER LA COMMANDE
  // ─────────────────────────────────────────────────────────────
  ouvrirModalAnnulation(): void {
    this.showAnnulationModal = true;
  }

  annulerCommande(): void {
    if (!this.commande || this.annulationForm.invalid) return;

    this.annulationLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const raison = this.annulationForm.value.raison;

    this.commandeService.annuler(this.commande.id, raison).subscribe({
      next: () => {
        this.showAnnulationModal = false;
        this.annulationLoading = false;
        this.successMessage = 'Commande annulée avec succès !';
        this.loadCommande(); // Recharger pour voir le statut annulé
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur annulation:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de l\'annulation';
        this.annulationLoading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 🖨️ IMPRIMER FACTURE
  // ─────────────────────────────────────────────────────────────
  imprimerFacture(): void {
    window.print();
  }

  fermerModalFacture(): void {
    this.showFactureModal = false;
    this.factureData = null;
  }

  // ─────────────────────────────────────────────────────────────
  // 🎨 HELPERS
  // ─────────────────────────────────────────────────────────────
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'validee':
        return 'bg-green-100 text-green-700';
      case 'en_cours':
        return 'bg-yellow-100 text-yellow-700';
      case 'annulee':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'validee':
        return 'Validée';
      case 'en_cours':
        return 'En cours';
      case 'annulee':
        return 'Annulée';
      default:
        return statut;
    }
  }
}
