import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService, PaginatedClients, Client } from '../../../core/services/client.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  pagination: any = null;
  loading = false;

  searchQuery = '';

  successMessage = '';
  errorMessage = '';

  filters = {
    per_page: 15,
    page: 1,
  };

  // Suppression
  showDeleteModal = false;
  clientToDelete: Client | null = null;
  deleteLoading = false;

  constructor(
    private clientService: ClientService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;

    const params: any = { ...this.filters };
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }

    this.clientService.getAll(params).subscribe({
      next: (response: PaginatedClients) => {
        this.clients = response.data;
        this.pagination = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement clients:', err);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.filters.page = 1; // Reset à la page 1
    this.loadClients();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadClients();
  }

  openDeleteModal(client: Client): void {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.clientToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientService.delete(this.clientToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Client supprimé avec succès !';
        this.showDeleteModal = false;
        this.clientToDelete = null;
        this.deleteLoading = false;
        this.loadClients();
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        this.deleteLoading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
