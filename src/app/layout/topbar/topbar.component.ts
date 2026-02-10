import { Component, EventEmitter, Output, HostListener, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BoutiqueService } from '../../core/services/boutique.service';
import { User } from '../../core/models/user.model';
import { Boutique } from '../../core/models/boutique.model';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  dropdownOpen = false;
  currentUser: User | null;
  boutiques: Boutique[] = [];
  selectedBoutique: Boutique | null = null;

  constructor(
    public authService: AuthService,
    public boutiqueService: BoutiqueService,
    private router: Router,
    private el: ElementRef
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    // Charger les boutiques si admin
    if (this.authService.isAdmin()) {
      this.boutiqueService.getAll().subscribe();

      this.boutiqueService.boutiques$.subscribe(data => {
        this.boutiques = data;
      });

      this.boutiqueService.selectedBoutique$.subscribe(b => {
        this.selectedBoutique = b;
      });
    }
  }

  onBoutiqueChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    if (!id) {
      // Toutes les boutiques
      this.boutiqueService.selectBoutique(null);
    } else {
      const boutique = this.boutiques.find(b => b.id === +id) ?? null;
      this.boutiqueService.selectBoutique(boutique);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(): string {
    return this.currentUser?.nom?.charAt(0)?.toUpperCase() ?? '?';
  }
}
