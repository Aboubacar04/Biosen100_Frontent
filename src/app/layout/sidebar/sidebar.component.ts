import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  route: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;

  readonly allNavItems: NavItem[] = [
    { route: '/dashboard',  label: 'Tableau de bord', icon: 'dashboard'  },
    { route: '/commandes',  label: 'Commandes',        icon: 'commandes'  },
    { route: '/produits',   label: 'Produits',          icon: 'produits'   },
    { route: '/categories', label: 'Catégories',        icon: 'categories' },
    { route: '/clients',    label: 'Clients',           icon: 'clients'    },
    { route: '/employes',   label: 'Employés',          icon: 'employes'   },
    { route: '/livreurs',   label: 'Livreurs',          icon: 'livreurs'   },
    { route: '/depenses',   label: 'Dépenses',          icon: 'depenses'   },
    { route: '/factures',   label: 'Factures',          icon: 'factures'   },
    { route: '/boutiques',  label: 'Boutiques',         icon: 'boutiques',  adminOnly: true },
    { route: '/users',      label: 'Utilisateurs',      icon: 'users',      adminOnly: true },
  ];

  navItems: NavItem[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.navItems = this.allNavItems.filter(
      item => !item.adminOnly || this.authService.isAdmin()
    );
  }
}
