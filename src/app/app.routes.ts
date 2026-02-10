import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { UsersComponent } from './pages/users/users.component';


export const routes: Routes = [
  { path: '',                redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',           component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password',  component: ResetPasswordComponent },

  // 🔒 Routes protégées avec Layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile',   component: ProfileComponent  },
      { path: 'users',     component: UsersComponent     },  // 👈 Ajoute
    ]
  },

  { path: '**', redirectTo: 'login' }
];
