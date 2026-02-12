import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeService, Employe } from '../../../core/services/employe.service';
import { BoutiqueService } from '../../../core/services/boutique.service';

@Component({
  selector: 'app-employe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employe-list.component.html',
})
export class EmployeListComponent implements OnInit {
  employes: Employe[] = [];
  loading = false;

  searchQuery = '';
  successMessage = '';
  errorMessage = '';

  showDeleteModal = false;
  employeToDelete: Employe | null = null;
  deleteLoading = false;

  constructor(
    private employeService: EmployeService,
    private boutiqueService: BoutiqueService
  ) {}

  ngOnInit(): void {
    this.loadEmployes();
  }

  loadEmployes(): void {
    this.loading = true;

    const params: any = {};
    const boutique = this.boutiqueService.getSelectedBoutique();
    if (boutique) {
      params.boutique_id = boutique.id;
    }
    if (this.searchQuery.trim()) {
      params.search = this.searchQuery;
    }

    this.employeService.getAll(params).subscribe({
      next: (employes) => {
        this.employes = employes;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement employés:', err);
        this.loading = false;
      },
    });
  }

  onSearchChange(): void {
    this.loadEmployes();
  }

  openDeleteModal(employe: Employe): void {
    this.employeToDelete = employe;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.employeToDelete) return;

    this.deleteLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.employeService.delete(this.employeToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Employé supprimé avec succès !';
        this.showDeleteModal = false;
        this.employeToDelete = null;
        this.deleteLoading = false;
        this.loadEmployes();
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

  getPhotoUrl(photo: string | null): string {
    if (!photo) return 'https://via.placeholder.com/100?text=Photo';
    return `http://localhost:8000/storage/${photo}`;
  }
}
