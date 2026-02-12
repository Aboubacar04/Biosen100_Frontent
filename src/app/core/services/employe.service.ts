import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

export interface Employe {
  id: number;
  nom: string;
  telephone: string;
  photo: string | null;
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployePayload {
  nom: string;
  telephone: string;
  boutique_id?: number;
  photo?: File;
}

export interface UpdateEmployePayload {
  nom?: string;
  telephone?: string;
  actif?: boolean;
  photo?: File;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class EmployeService {
  private apiUrl = 'http://localhost:8000/api/employes';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUS LES EMPLOYÉS
  // GET /api/employes?boutique_id=&actif=&search=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    actif?: boolean;
    search?: string;
  }): Observable<Employe[]> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.actif !== undefined) params = params.set('actif', filters.actif ? '1' : '0');
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Employe[]>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UN EMPLOYÉ
  // POST /api/employes (avec photo possible)
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateEmployePayload): Observable<{ message: string; employe: Employe }> {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('telephone', payload.telephone);
    if (payload.boutique_id) formData.append('boutique_id', payload.boutique_id.toString());
    if (payload.photo) formData.append('photo', payload.photo);

    return this.http.post<{ message: string; employe: Employe }>(this.apiUrl, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN EMPLOYÉ
  // GET /api/employes/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UN EMPLOYÉ
  // POST /api/employes/{id} (car upload photo)
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateEmployePayload): Observable<{ message: string; employe: Employe }> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (payload.nom) formData.append('nom', payload.nom);
    if (payload.telephone) formData.append('telephone', payload.telephone);
    if (payload.actif !== undefined) formData.append('actif', payload.actif ? '1' : '0');
    if (payload.photo) formData.append('photo', payload.photo);

    return this.http.post<{ message: string; employe: Employe }>(`${this.apiUrl}/${id}`, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UN EMPLOYÉ
  // DELETE /api/employes/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
