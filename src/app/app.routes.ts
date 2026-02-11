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
      // ── À ajouter au fur et à mesure ─────────────────────
      // { path: 'boutiques',  loadComponent: () => import('./pages/boutiques/boutiques.component').then(m => m.BoutiquesComponent)  },
      // { path: 'categories', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      // { path: 'produits',   loadComponent: () => import('./pages/produits/produits.component').then(m => m.ProduitsComponent)     },
      // { path: 'employes',   loadComponent: () => import('./pages/employes/employes.component').then(m => m.EmployesComponent)     },
      // { path: 'livreurs',   loadComponent: () => import('./pages/livreurs/livreurs.component').then(m => m.LivreursComponent)     },
      // { path: 'clients',    loadComponent: () => import('./pages/clients/clients.component').then(m => m.ClientsComponent)       },
      // { path: 'commandes',  loadComponent: () => import('./pages/commandes/commandes.component').then(m => m.CommandesComponent)  },
      // { path: 'factures',   loadComponent: () => import('./pages/factures/factures.component').then(m => m.FacturesComponent)    },
      // { path: 'depenses',   loadComponent: () => import('./pages/depenses/depenses.component').then(m => m.DepensesComponent)    },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
