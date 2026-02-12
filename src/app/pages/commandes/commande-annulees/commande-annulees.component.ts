import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommandeService, PaginatedCommandes, Commande } from '../../../core/services/commande.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-commande-annulees',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './commande-annulees.component.html',
})
export class CommandeAnnuleesComponent implements OnInit {
  commandes: Commande[] = [];
  pagination: any = null;
  loading = false;

  filters = {
    per_page: 15,
    page: 1,
  };

  constructor(
    private commandeService: CommandeService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.loading = true;

    const params: any = { ...this.filters };
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }

    this.commandeService.getAnnulees(params).subscribe({
      next: (response: PaginatedCommandes) => {
        this.commandes = response.data;
        this.pagination = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes annulées:', err);
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadCommandes();
  }
}
