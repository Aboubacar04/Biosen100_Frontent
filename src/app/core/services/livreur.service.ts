import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

export interface Livreur {
  id: number;
  nom: string;
  telephone: string;
  disponible: boolean;
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

export interface LivreurStatistiques {
  total_livraisons: number;
  montant_total_livre: number;
  livraison_moyenne: number;
  derniere_livraison: string | null;
  livraisons_validees: number;
  livraisons_en_cours: number;
  livraisons_annulees: number;
}

export interface LivreurDetailResponse {
  livreur: Livreur;
  statistiques: LivreurStatistiques;
  commandes: CommandeResume[];
}

export interface PaginatedLivreurs {
  current_page: number;
  data: Livreur[];
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

export interface CreateLivreurPayload {
  nom: string;
  telephone: string;
  boutique_id?: number;
}

export interface UpdateLivreurPayload {
  nom?: string;
  telephone?: string;
  disponible?: boolean;
  actif?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class LivreurService {
  private apiUrl = 'http://localhost:8000/api/livreurs';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUS LES LIVREURS (PAGINÉ)
  // GET /api/livreurs?boutique_id=&actif=&disponible=&search=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    actif?: boolean | null;
    disponible?: boolean | null;
    search?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedLivreurs> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.actif !== null && filters?.actif !== undefined) {
      params = params.set('actif', filters.actif ? '1' : '0');
    }
    if (filters?.disponible !== null && filters?.disponible !== undefined) {
      params = params.set('disponible', filters.disponible ? '1' : '0');
    }
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedLivreurs>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ LIVREURS DISPONIBLES
  // GET /api/livreurs/disponibles?boutique_id=
  // ─────────────────────────────────────────────────────────────
  getDisponibles(boutiqueId?: number): Observable<Livreur[]> {
    let params = new HttpParams();
    if (boutiqueId) params = params.set('boutique_id', boutiqueId.toString());

    return this.http.get<Livreur[]>(`${this.apiUrl}/disponibles`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN LIVREUR AVEC STATS
  // GET /api/livreurs/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<LivreurDetailResponse> {
    return this.http.get<LivreurDetailResponse>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UN LIVREUR
  // POST /api/livreurs
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateLivreurPayload): Observable<{ message: string; livreur: Livreur }> {
    return this.http.post<{ message: string; livreur: Livreur }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UN LIVREUR
  // PUT /api/livreurs/{id}
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateLivreurPayload): Observable<{ message: string; livreur: Livreur }> {
    return this.http.put<{ message: string; livreur: Livreur }>(`${this.apiUrl}/${id}`, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UN LIVREUR
  // DELETE /api/livreurs/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 🔄 BASCULER DISPONIBILITÉ
  // POST /api/livreurs/{id}/toggle-disponibilite
  // ─────────────────────────────────────────────────────────────
  toggleDisponibilite(id: number): Observable<{ message: string; livreur: Livreur }> {
    return this.http.post<{ message: string; livreur: Livreur }>(
      `${this.apiUrl}/${id}/toggle-disponibilite`,
      {}
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ ACTIVER UN LIVREUR
  // ─────────────────────────────────────────────────────────────
  activer(id: number): Observable<{ message: string; livreur: Livreur }> {
    return this.update(id, { actif: true });
  }

  // ─────────────────────────────────────────────────────────────
  // ❌ DÉSACTIVER UN LIVREUR
  // ─────────────────────────────────────────────────────────────
  desactiver(id: number): Observable<{ message: string; livreur: Livreur }> {
    return this.update(id, { actif: false });
  }

  // ─────────────────────────────────────────────────────────────
  // 🟢 MARQUER DISPONIBLE
  // ─────────────────────────────────────────────────────────────
  marquerDisponible(id: number): Observable<{ message: string; livreur: Livreur }> {
    return this.update(id, { disponible: true });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔴 MARQUER OCCUPÉ
  // ─────────────────────────────────────────────────────────────
  marquerOccupe(id: number): Observable<{ message: string; livreur: Livreur }> {
    return this.update(id, { disponible: false });
  }
}
