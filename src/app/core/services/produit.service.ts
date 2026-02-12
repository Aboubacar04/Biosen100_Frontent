import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  boutique_id: number;
  created_at: string;
  updated_at: string;
}

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix_vente: string;
  stock: number;
  seuil_alerte: number;
  image: string | null;
  categorie_id: number;
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
  categorie?: Categorie;
}

export interface PaginatedProduits {
  current_page: number;
  data: Produit[];
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

export interface CreateProduitPayload {
  nom: string;
  description?: string;
  prix_vente: number;
  stock: number;
  seuil_alerte: number;
  categorie_id: number;
  boutique_id?: number;
  image?: File;
}

export interface UpdateProduitPayload {
  nom?: string;
  description?: string;
  prix_vente?: number;
  stock?: number;
  seuil_alerte?: number;
  categorie_id?: number;
  actif?: boolean;
  image?: File;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private apiUrl = 'http://localhost:8000/api/produits';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUS LES PRODUITS
  // GET /api/produits?boutique_id=&categorie_id=&actif=&per_page=&page=&search=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    categorie_id?: number;
    actif?: boolean;
    per_page?: number;
    page?: number;
    search?: string;
  }): Observable<PaginatedProduits> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.categorie_id) params = params.set('categorie_id', filters.categorie_id.toString());
    if (filters?.actif !== undefined) params = params.set('actif', filters.actif ? '1' : '0');
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<PaginatedProduits>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ⚠️ PRODUITS EN STOCK FAIBLE
  // GET /api/produits/stock-faible?boutique_id=
  // ─────────────────────────────────────────────────────────────
  getStockFaible(boutiqueId?: number): Observable<Produit[]> {
    let params = new HttpParams();
    if (boutiqueId) params = params.set('boutique_id', boutiqueId.toString());

    return this.http.get<Produit[]>(`${this.apiUrl}/stock-faible`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UN PRODUIT
  // POST /api/produits (avec image possible)
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateProduitPayload): Observable<{ message: string; produit: Produit }> {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    if (payload.description) formData.append('description', payload.description);
    formData.append('prix_vente', payload.prix_vente.toString());
    formData.append('stock', payload.stock.toString());
    formData.append('seuil_alerte', payload.seuil_alerte.toString());
    formData.append('categorie_id', payload.categorie_id.toString());
    if (payload.boutique_id) formData.append('boutique_id', payload.boutique_id.toString());
    if (payload.image) formData.append('image', payload.image);

    return this.http.post<{ message: string; produit: Produit }>(this.apiUrl, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN PRODUIT
  // GET /api/produits/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UN PRODUIT
  // POST /api/produits/{id} (car upload image)
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateProduitPayload): Observable<{ message: string; produit: Produit }> {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    if (payload.nom) formData.append('nom', payload.nom);
    if (payload.description) formData.append('description', payload.description);
    if (payload.prix_vente) formData.append('prix_vente', payload.prix_vente.toString());
    if (payload.stock !== undefined) formData.append('stock', payload.stock.toString());
    if (payload.seuil_alerte) formData.append('seuil_alerte', payload.seuil_alerte.toString());
    if (payload.categorie_id) formData.append('categorie_id', payload.categorie_id.toString());
    if (payload.image) formData.append('image', payload.image);

    return this.http.post<{ message: string; produit: Produit }>(`${this.apiUrl}/${id}`, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UN PRODUIT
  // DELETE /api/produits/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
