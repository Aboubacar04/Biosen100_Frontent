import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LivreurDetailComponent } from './pages/livreurs/livreur-detail/livreur-detail.component';

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
          {
  path: ':id',
  loadComponent: () => import('./pages/clients/client-detail/client-detail.component')
    .then(m => m.ClientDetailComponent),
}
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
      path: ':id',  // ← NOUVELLE ROUTE
      loadComponent: () => import('./pages/employes/employe-detail/employe-detail.component')
        .then(m => m.EmployeDetailComponent),
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
            path: ':id/edit',
            loadComponent: () => import('./pages/livreurs/livreur-edit/livreur-edit.component')
              .then(m => m.LivreurEditComponent),
          },
          { path: ':id', loadComponent: () => import('./pages/livreurs/livreur-detail/livreur-detail.component').then(m => m.LivreurDetailComponent) },
        ],
      },

      // src/app/app.routes.ts

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
    // ✅ AJOUTER CETTE ROUTE (APRÈS edit/:id mais AVANT :id si tu veux)
    {
      path: ':id',
      loadComponent: () => import('./pages/produits/produit-detail/produit-detail.component')
        .then(m => m.ProduitDetailComponent),
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

      // Dans src/app/app.routes.ts
// Après le module commandes

{
  path: 'depenses',
  children: [
    {
      path: '',
      loadComponent: () => import('./pages/depenses/depense-list/depense-list.component')
        .then(m => m.DepenseListComponent),
    },
    {
      path: 'create',
      loadComponent: () => import('./pages/depenses/depense-create/depense-create.component')
        .then(m => m.DepenseCreateComponent),
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('./pages/depenses/depense-edit/depense-edit.component')
        .then(m => m.DepenseEditComponent),
    },
    {
      path: ':id',
      loadComponent: () => import('./pages/depenses/depense-detail/depense-detail.component')
        .then(m => m.DepenseDetailComponent),
    },
  ],
},

// Dans src/app/app.routes.ts
// Après le module depenses

{
  path: 'categories',
  children: [
    {
      path: '',
      loadComponent: () => import('./pages/categories/categorie-list/categorie-list.component')
        .then(m => m.CategorieListComponent),
    },
    {
      path: 'create',
      loadComponent: () => import('./pages/categories/categorie-create/categorie-create.component')
        .then(m => m.CategorieCreateComponent),
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('./pages/categories/categorie-edit/categorie-edit.component')
        .then(m => m.CategorieEditComponent),
    },
    {
      path: ':id',
      loadComponent: () => import('./pages/categories/categorie-detail/categorie-detail.component')
        .then(m => m.CategorieDetailComponent),
    },
  ],
},
{
  path: 'boutiques',
  children: [
    {
      path: '',
      loadComponent: () => import('./pages/boutiques/boutique-list/boutique-list.component')
        .then(m => m.BoutiqueListComponent),
    },
    {
      path: 'create',
      loadComponent: () => import('./pages/boutiques/boutique-create/boutique-create.component')
        .then(m => m.BoutiqueCreateComponent),
    },
    {
      path: 'edit/:id',
      loadComponent: () => import('./pages/boutiques/boutique-edit/boutique-edit.component')
        .then(m => m.BoutiqueEditComponent),
    },
    {
      path: ':id',
      loadComponent: () => import('./pages/boutiques/boutique-detail/boutique-detail.component')
        .then(m => m.BoutiqueDetailComponent),
    },
  ],
},

      // ══════════════════════════════════════════════════════
// 🧾 MODULE FACTURES
// ══════════════════════════════════════════════════════
{
  path: 'factures',
  children: [
    {
      path: '',
      loadComponent: () => import('./pages/factures/facture-list/facture-list.component')
        .then(m => m.FactureListComponent),
    },
    {
      path: ':id',
      loadComponent: () => import('./pages/factures/facture-detail/facture-detail.component')
        .then(m => m.FactureDetailComponent),
    },
  ],
},
    ],
  },

  { path: '**', redirectTo: 'login' },
];
