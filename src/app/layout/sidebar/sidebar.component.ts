import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() isOpen = true;

  allNavItems: NavItem[] = [
    { label: 'Tableau de bord', icon: '📊', route: '/dashboard'  },
    { label: 'Commandes',       icon: '🛒', route: '/commandes'  },
    { label: 'Produits',        icon: '📦', route: '/produits'   },
    { label: 'Factures',        icon: '🧾', route: '/factures'   },
    { label: 'Catégories',      icon: '📂', route: '/categories' },
    { label: 'Employés',        icon: '👷', route: '/employes'   },
    { label: 'Livreurs',        icon: '🚚', route: '/livreurs'   },
    { label: 'Clients',         icon: '👥', route: '/clients'    },
    { label: 'Dépenses',        icon: '💰', route: '/depenses'   },
    // Admin seulement
    { label: 'Utilisateurs',    icon: '👤', route: '/users',     adminOnly: true },
    { label: 'Boutiques',       icon: '🏪', route: '/boutiques', adminOnly: true },
  ];

  constructor(public authService: AuthService) {}

  get navItems(): NavItem[] {
    if (this.authService.isAdmin()) {
      return this.allNavItems;
    }
    return this.allNavItems.filter(item => !item.adminOnly);
  }
}
