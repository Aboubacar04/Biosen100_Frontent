import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeService, Employe } from '../../../core/services/employe.service';

@Component({
  selector: 'app-employe-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './employe-edit.component.html',
})
export class EmployeEditComponent implements OnInit {
  form!: FormGroup;
  employe: Employe | null = null;
  loading = false;
  loadingData = false;
  successMessage = '';
  errorMessage = '';
  photoPreview: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private employeService: EmployeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmploye(+id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      telephone: ['', Validators.required],
      actif: [true],
    });
  }

  loadEmploye(id: number): void {
    this.loadingData = true;
    this.employeService.getById(id).subscribe({
      next: (employe) => {
        this.employe = employe;
        this.form.patchValue({
          nom: employe.nom,
          telephone: employe.telephone,
          actif: employe.actif,
        });
        if (employe.photo) {
          this.photoPreview = `http://localhost:8000/storage/${employe.photo}`;
        }
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Erreur chargement:', err);
        this.errorMessage = 'Employé introuvable';
        this.loadingData = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
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
    if (this.form.invalid || !this.employe) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: any = {
      ...this.form.value,
    };

    if (this.selectedFile) {
      payload.photo = this.selectedFile;
    }

    this.employeService.update(this.employe.id, payload).subscribe({
      next: () => {
        this.successMessage = 'Employé modifié avec succès !';
        setTimeout(() => {
          this.router.navigate(['/employes']);
        }, 1500);
      },
      error: (err) => {
        console.error('Erreur modification:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.loading = false;
        setTimeout(() => { this.errorMessage = ''; }, 5000);
      },
    });
  }
}
