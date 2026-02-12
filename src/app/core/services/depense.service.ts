import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

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

export interface Depense {
  id: number;
  boutique_id: number;
  description: string;
  montant: string;
  categorie: string;
  date_depense: string;
  created_at: string;
  updated_at: string;
  boutique?: Boutique;
}

export interface PaginatedDepenses {
  current_page: number;
  data: Depense[];
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

export interface CreateDepensePayload {
  description: string;
  montant: number;
  categorie: string;
  date_depense: string;
  boutique_id?: number;
}

export interface UpdateDepensePayload {
  description?: string;
  montant?: number;
  categorie?: string;
  date_depense?: string;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class DepenseService {
  private apiUrl = 'http://localhost:8000/api/depenses';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUTES LES DÉPENSES
  // GET /api/depenses?boutique_id=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedDepenses> {
    let params = new HttpParams();

    if (filters?.boutique_id) {
      params = params.set('boutique_id', filters.boutique_id.toString());
    }

    if (filters?.per_page) {
      params = params.set('per_page', filters.per_page.toString());
    }

    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }

    return this.http.get<PaginatedDepenses>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 📅 DÉPENSES PAR DATE
  // GET /api/depenses/par-date?date=2024-01-15&boutique_id=
  // ─────────────────────────────────────────────────────────────
  getByDate(date: string, boutiqueId?: number): Observable<Depense[]> {
    let params = new HttpParams().set('date', date);

    if (boutiqueId) {
      params = params.set('boutique_id', boutiqueId.toString());
    }

    return this.http.get<Depense[]>(`${this.apiUrl}/par-date`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UNE DÉPENSE
  // POST /api/depenses
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateDepensePayload): Observable<{ message: string; depense: Depense }> {
    return this.http.post<{ message: string; depense: Depense }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UNE DÉPENSE
  // GET /api/depenses/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Depense> {
    return this.http.get<Depense>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UNE DÉPENSE
  // PUT /api/depenses/{id}
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateDepensePayload): Observable<{ message: string; depense: Depense }> {
    return this.http.put<{ message: string; depense: Depense }>(`${this.apiUrl}/${id}`, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE DÉPENSE
  // DELETE /api/depenses/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
