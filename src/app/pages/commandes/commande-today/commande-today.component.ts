import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService, HistoriqueResponse, Commande } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-today',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-today.component.html',
})
export class CommandeTodayComponent implements OnInit {
  commandes: Commande[] = [];
  pagination: any = null;
  resume: any = null;
  loading = false;

  selectedDate: string = '';

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService
  ) {
    // Date du jour par défaut
    const today = new Date();
    this.selectedDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadHistorique();
  }

  loadHistorique(): void {
    this.loading = true;

    const params: any = {};
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.commandeService.getHistorique(this.selectedDate, params).subscribe({
      next: (response: HistoriqueResponse) => {
        this.resume = response.resume;
        this.commandes = response.commandes.data;
        this.pagination = response.commandes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement historique:', err);
        this.loading = false;
      },
    });
  }

  onDateChange(): void {
    this.loadHistorique();
  }

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
