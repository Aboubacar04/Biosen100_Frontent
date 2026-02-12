import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Auth (pas besoin de lazy, pages légères) ─────────────
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent),
  },

  // ── Routes protégées avec Layout ─────────────────────────
  {
    path: '',
    loadComponent: () => import('./layout/layout.component')
      .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component')
          .then(m => m.ProfileComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component')
          .then(m => m.UsersComponent),
      },

      // ══════════════════════════════════════════════════════
      // 👥 MODULE CLIENTS
      // ══════════════════════════════════════════════════════
      {
        path: 'clients',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/clients/client-list/client-list.component')
              .then(m => m.ClientListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/clients/client-create/client-create.component')
              .then(m => m.ClientCreateComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./pages/clients/client-edit/client-edit.component')
              .then(m => m.ClientEditComponent),
          },
        ],
      },

      // ══════════════════════════════════════════════════════
      // 👷 MODULE EMPLOYÉS
      // ══════════════════════════════════════════════════════
      {
        path: 'employes',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/employes/employe-list/employe-list.component')
              .then(m => m.EmployeListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/employes/employe-create/employe-create.component')
              .then(m => m.EmployeCreateComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./pages/employes/employe-edit/employe-edit.component')
              .then(m => m.EmployeEditComponent),
          },
        ],
      },

      // ══════════════════════════════════════════════════════
      // 🚚 MODULE LIVREURS
      // ══════════════════════════════════════════════════════
      {
        path: 'livreurs',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/livreurs/livreur-list/livreur-list.component')
              .then(m => m.LivreurListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/livreurs/livreur-create/livreur-create.component')
              .then(m => m.LivreurCreateComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./pages/livreurs/livreur-edit/livreur-edit.component')
              .then(m => m.LivreurEditComponent),
          },
        ],
      },

      // ══════════════════════════════════════════════════════
      // 📦 MODULE PRODUITS
      // ══════════════════════════════════════════════════════
      {
        path: 'produits',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/produits/produit-list/produit-list.component')
              .then(m => m.ProduitListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/produits/produit-create/produit-create.component')
              .then(m => m.ProduitCreateComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./pages/produits/produit-edit/produit-edit.component')
              .then(m => m.ProduitEditComponent),
          },
        ],
      },

      // ══════════════════════════════════════════════════════
      // 📦 MODULE COMMANDES
      // ══════════════════════════════════════════════════════
      {
        path: 'commandes',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/commandes/commande-list/commande-list.component')
              .then(m => m.CommandeListComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./pages/commandes/commande-create/commande-create.component')
              .then(m => m.CommandeCreateComponent),
          },
          {
            path: 'en-cours',
            loadComponent: () => import('./pages/commandes/commande-en-cours/commande-en-cours.component')
              .then(m => m.CommandeEnCoursComponent),
          },
          {
            path: 'validees',
            loadComponent: () => import('./pages/commandes/commande-validees/commande-validees.component')
              .then(m => m.CommandeValideesComponent),
          },
          {
            path: 'annulees',
            loadComponent: () => import('./pages/commandes/commande-annulees/commande-annulees.component')
              .then(m => m.CommandeAnnuleesComponent),
          },
          {
            path: 'today',
            loadComponent: () => import('./pages/commandes/commande-today/commande-today.component')
              .then(m => m.CommandeTodayComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/commandes/commande-detail/commande-detail.component')
              .then(m => m.CommandeDetailComponent),
          },
        ],
      },

      // ── À ajouter au fur et à mesure ─────────────────────
      // { path: 'boutiques',  loadComponent: () => import('./pages/boutiques/boutiques.component').then(m => m.BoutiquesComponent)  },
      // { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      // { path: 'factures',   loadComponent: () => import('./pages/factures/factures.component').then(m => m.FacturesComponent)    },
      // { path: 'depenses',   loadComponent: () => import('./pages/depenses/depenses.component').then(m => m.DepensesComponent)    },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
