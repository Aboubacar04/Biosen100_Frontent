import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  showConfirm = false;

  // Récupérés depuis l'URL
  token = '';
  email = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {
    // Récupérer token et email depuis l'URL
    // Exemple : /reset-password?token=xxx&email=yyy
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.token || !this.email) {
      this.errorMessage = 'Lien de réinitialisation invalide ou expiré.';
    }
  }

  passwordsMatch(group: FormGroup) {
    const pass    = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token || !this.email) return;

    this.loading = true;
    this.errorMessage = '';

    const data = {
      token:                 this.token,
      email:                 this.email,
      password:              this.form.value.password,
      password_confirmation: this.form.value.password_confirmation
    };

    this.authService.resetPassword(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = res.message || 'Mot de passe réinitialisé avec succès !';
        // Redirection automatique après 2 secondes
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Lien expiré ou invalide. Recommencez.';
      }
    });
  }

  get password()              { return this.form.get('password'); }
  get password_confirmation() { return this.form.get('password_confirmation'); }
}
