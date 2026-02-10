import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {

  currentUser: User | null;
  activeTab: 'info' | 'password' = 'info';

  infoForm: FormGroup;
  passwordForm: FormGroup;

  loadingInfo = false;
  loadingPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();

    this.infoForm = this.fb.group({
      nom:   [this.currentUser?.nom   ?? '', Validators.required],
      email: [this.currentUser?.email ?? '', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['',  Validators.required],
    }, { validators: this.passwordsMatch });
  }

  ngOnInit(): void {}

  passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const c = group.get('password_confirmation')?.value;
    return p === c ? null : { mismatch: true };
  }

  setTab(tab: 'info' | 'password') {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSaveInfo(): void {
    // À brancher sur PUT /api/users/{id} plus tard
    this.successMessage = 'Informations mises à jour !';
  }

  onChangePassword(): void {
    // À brancher sur PUT /api/users/{id} plus tard
    this.successMessage = 'Mot de passe modifié avec succès !';
    this.passwordForm.reset();
  }

  get password()              { return this.passwordForm.get('password'); }
  get password_confirmation() { return this.passwordForm.get('password_confirmation'); }
}
