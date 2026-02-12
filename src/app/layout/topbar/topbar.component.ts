import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BoutiqueService } from '../../core/services/boutique.service';
import { Boutique } from '../../core/models/boutique.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  boutiques: Boutique[] = [];
  selectedBoutique: Boutique | null = null;
  currentUser: User | null = null;
  dropdownOpen = false;

  constructor(
    public authService: AuthService,
    private boutiqueService: BoutiqueService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.authService.isAdmin()) {
      this.boutiqueService.getAll().subscribe(data => this.boutiques = data);
    }
  }

  onBoutiqueChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedBoutique = id
      ? this.boutiques.find(b => b.id === +id) ?? null
      : null;
    this.boutiqueService.selectBoutique(this.selectedBoutique);
  }

  getInitials(): string {
    const name = this.currentUser?.nom ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
  }
}
