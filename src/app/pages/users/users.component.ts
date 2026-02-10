import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { BoutiqueService } from '../../core/services/boutique.service';
import { User } from '../../core/models/user.model';
import { Boutique } from '../../core/models/boutique.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  boutiques: Boutique[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Modal
  showModal = false;
  isEditing = false;
  selectedUser: User | null = null;

  // Confirm delete
  showConfirmDelete = false;
  userToDelete: User | null = null;

  form: FormGroup;

  constructor(
    private userService: UserService,
    private boutiqueService: BoutiqueService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nom:         ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      password:    [''],
      role:        ['gerant', Validators.required],
      boutique_id: [null],
      actif:       [true]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadBoutiques();

    // Écouter changement de rôle pour boutique_id
    this.form.get('role')?.valueChanges.subscribe(role => {
      if (role === 'admin') {
        this.form.get('boutique_id')?.setValue(null);
        this.form.get('boutique_id')?.clearValidators();
      } else {
        this.form.get('boutique_id')?.setValidators(Validators.required);
      }
      this.form.get('boutique_id')?.updateValueAndValidity();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadBoutiques(): void {
    this.boutiqueService.getAll().subscribe({
      next: (data) => { this.boutiques = data; }
    });
  }

  // 📋 OUVRIR MODAL CRÉATION
  openCreate(): void {
    this.isEditing = false;
    this.selectedUser = null;
    this.form.reset({ role: 'gerant', actif: true });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.clearMessages();
  }

  // ✏️ OUVRIR MODAL ÉDITION
  openEdit(user: User): void {
    this.isEditing = true;
    this.selectedUser = user;
    this.form.patchValue({
      nom:         user.nom,
      email:       user.email,
      role:        user.role,
      boutique_id: user.boutique_id,
      actif:       user.actif,
      password:    ''
    });
    // Mot de passe optionnel en édition
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal = true;
    this.clearMessages();
  }

  // 💾 SOUMETTRE
  onSubmit(): void {
    if (this.form.invalid) return;

    const data = { ...this.form.value };

    // Ne pas envoyer le password si vide en édition
    if (this.isEditing && !data.password) {
      delete data.password;
    }

    if (this.isEditing && this.selectedUser) {
      this.userService.update(this.selectedUser.id, data).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur modifié avec succès !';
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        }
      });
    } else {
      this.userService.create(data).subscribe({
        next: () => {
          this.successMessage = 'Utilisateur créé avec succès !';
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la création';
        }
      });
    }
  }

  // 🔄 TOGGLE ACTIF
  toggleActif(user: User): void {
    this.userService.toggleActif(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur';
      }
    });
  }

  // 🗑️ SUPPRIMER
  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.showConfirmDelete = true;
  }

  deleteUser(): void {
    if (!this.userToDelete) return;
    this.userService.delete(this.userToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Utilisateur supprimé !';
        this.showConfirmDelete = false;
        this.userToDelete = null;
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        this.showConfirmDelete = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  getBoutiqueName(id: number | null): string {
    if (!id) return '-';
    return this.boutiques.find(b => b.id === id)?.nom ?? '-';
  }

  get roleControl()      { return this.form.get('role'); }
  get boutiqueControl()  { return this.form.get('boutique_id'); }
}
