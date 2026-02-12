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
  actif: boolean;
  boutique_id: number;
  created_at: string;
  updated_at: string;
  boutique?: Boutique;
}

export interface Boutique {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  logo: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommandeResume {
  id: number;
  numero_commande: string;
  statut: 'en_cours' | 'validee' | 'annulee';
  total: string;
  type_commande: 'sur_place' | 'livraison';
  notes: string | null;
  date_commande: string;
  created_at: string;
  client: {
    id: number;
    nom_complet: string;
    telephone: string;
  } | null;
}

export interface EmployeStatistiques {
  total_commandes: number;
  total_ventes: number;
  vente_moyenne: number;
  derniere_commande: string | null;
  commandes_validees: number;
  commandes_en_cours: number;
  commandes_annulees: number;
  ventes_jour: number;
  ventes_mois: number;
}

export interface EmployeDetailResponse {
  employe: Employe;
  statistiques: EmployeStatistiques;
  commandes: CommandeResume[];
}

export interface PaginatedEmployes {
  current_page: number;
  data: Employe[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CreateEmployePayload {
  nom: string;
  telephone: string;
  photo?: File;
  boutique_id?: number;
}

export interface UpdateEmployePayload {
  nom?: string;
  telephone?: string;
  photo?: File;
  actif?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class EmployeService {
  private apiUrl = 'http://localhost:8000/api/employes';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUS LES EMPLOYÉS (PAGINÉ)
  // GET /api/employes?boutique_id=&actif=&search=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    actif?: boolean | null;
    search?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedEmployes> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.actif !== null && filters?.actif !== undefined) {
      params = params.set('actif', filters.actif ? '1' : '0');
    }
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedEmployes>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN EMPLOYÉ AVEC STATS
  // GET /api/employes/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<EmployeDetailResponse> {
    return this.http.get<EmployeDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UN EMPLOYÉ (avec photo)
  // POST /api/employes
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
  // ✏️ MODIFIER UN EMPLOYÉ (avec photo)
  // POST /api/employes/{id} (car upload photo)
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateEmployePayload): Observable<{ message: string; employe: Employe }> {
    const formData = new FormData();
    formData.append('_method', 'POST');
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

  // ─────────────────────────────────────────────────────────────
  // ✅ ACTIVER UN EMPLOYÉ
  // ─────────────────────────────────────────────────────────────
  activer(id: number): Observable<{ message: string; employe: Employe }> {
    return this.update(id, { actif: true });
  }

  // ─────────────────────────────────────────────────────────────
  // ❌ DÉSACTIVER UN EMPLOYÉ
  // ─────────────────────────────────────────────────────────────
  desactiver(id: number): Observable<{ message: string; employe: Employe }> {
    return this.update(id, { actif: false });
  }
}
