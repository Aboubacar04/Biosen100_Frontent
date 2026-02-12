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
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
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
  // 📋 LISTE TOUS LES LIVREURS
  // GET /api/livreurs?boutique_id=&actif=&search=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    actif?: boolean;
    search?: string;
  }): Observable<Livreur[]> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.actif !== undefined) params = params.set('actif', filters.actif ? '1' : '0');
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Livreur[]>(this.apiUrl, { params });
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
  // ➕ CRÉER UN LIVREUR
  // POST /api/livreurs
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateLivreurPayload): Observable<{ message: string; livreur: Livreur }> {
    return this.http.post<{ message: string; livreur: Livreur }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN LIVREUR
  // GET /api/livreurs/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Livreur> {
    return this.http.get<Livreur>(`${this.apiUrl}/${id}`);
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
