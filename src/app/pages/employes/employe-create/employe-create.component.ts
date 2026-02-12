import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeService } from '../../../core/services/employe.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employe-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './employe-create.component.html',
})
export class EmployeCreateComponent {
  form!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  photoPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private boutiqueService: BoutiqueService,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.photoPreview = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: any = {
      ...this.form.value,
    };

    if (this.authService.isAdmin()) {
      const boutique = this.boutiqueService.getSelectedBoutique();
      if (boutique) {
        payload.boutique_id = boutique.id;
      }
    }

    if (this.selectedFile) {
      payload.photo = this.selectedFile;
    }

    this.employeService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'Employé créé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/employes']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur création:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la création';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
