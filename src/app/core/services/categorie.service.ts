import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

export interface Categorie {
  id: number;
  nom: string;
  description: string | null;
  boutique_id: number;
  created_at: string;
  updated_at: string;
  produits_count?: number;
  produits?: Produit[];
}

export interface Produit {
  id: number;
  nom: string;
  description: string | null;
  prix_vente: string;
  stock: number;
  seuil_alerte: number;
  image: string | null;
  categorie_id: number;
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoriePayload {
  nom: string;
  description?: string;
  boutique_id?: number;
}

export interface UpdateCategoriePayload {
  nom?: string;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private apiUrl = 'http://localhost:8000/api/categories';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUTES LES CATÉGORIES
  // GET /api/categories?boutique_id=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: { boutique_id?: number }): Observable<Categorie[]> {
    let params = new HttpParams();

    if (filters?.boutique_id) {
      params = params.set('boutique_id', filters.boutique_id.toString());
    }

    return this.http.get<Categorie[]>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UNE CATÉGORIE
  // POST /api/categories
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateCategoriePayload): Observable<{ message: string; categorie: Categorie }> {
    return this.http.post<{ message: string; categorie: Categorie }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UNE CATÉGORIE
  // GET /api/categories/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UNE CATÉGORIE
  // PUT /api/categories/{id}
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateCategoriePayload): Observable<{ message: string; categorie: Categorie }> {
    return this.http.put<{ message: string; categorie: Categorie }>(`${this.apiUrl}/${id}`, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE CATÉGORIE
  // DELETE /api/categories/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
