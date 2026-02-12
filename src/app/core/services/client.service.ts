import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 📦 INTERFACES / MODELS
// ═══════════════════════════════════════════════════════════════

export interface Client {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse: string;
  boutique_id: number;
  created_at: string;
  updated_at: string;
  commandes_count?: number;
}

export interface PaginatedClients {
  current_page: number;
  data: Client[];
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

export interface CreateClientPayload {
  nom_complet: string;
  telephone: string;
  adresse?: string;
  boutique_id?: number;
}

export interface UpdateClientPayload {
  nom_complet?: string;
  telephone?: string;
  adresse?: string;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class ClientService {
  private apiUrl = 'http://localhost:8000/api/clients';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUS LES CLIENTS
  // GET /api/clients?boutique_id=&search=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    search?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedClients> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedClients>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 AUTOCOMPLETE CLIENTS (pour commande-create)
  // GET /api/clients/autocomplete?q=&boutique_id=
  // ─────────────────────────────────────────────────────────────
  autocomplete(query: string, boutiqueId?: number | null): Observable<Client[]> {
    let params = new HttpParams().set('q', query);
    if (boutiqueId) {
      params = params.set('boutique_id', boutiqueId.toString());
    }
    return this.http.get<Client[]>(`${this.apiUrl}/autocomplete`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 RECHERCHER UN CLIENT PAR TÉLÉPHONE
  // GET /api/clients/search?telephone=
  // ─────────────────────────────────────────────────────────────
  search(telephone: string): Observable<Client | null> {
    const params = new HttpParams().set('telephone', telephone);
    return this.http.get<Client | null>(`${this.apiUrl}/search`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UN CLIENT
  // POST /api/clients
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateClientPayload): Observable<{ message: string; client: Client }> {
    return this.http.post<{ message: string; client: Client }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UN CLIENT
  // GET /api/clients/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UN CLIENT
  // PUT /api/clients/{id}
  // ─────────────────────────────────────────────────────────────
  update(id: number, payload: UpdateClientPayload): Observable<{ message: string; client: Client }> {
    return this.http.put<{ message: string; client: Client }>(`${this.apiUrl}/${id}`, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 RECHERCHE PAR TÉLÉPHONE (pour commandes)
  // GET /api/clients/recherche-telephone?telephone=
  // ─────────────────────────────────────────────────────────────
  searchByPhone(telephone: string, boutiqueId?: number | null): Observable<Client> {
    let params = new HttpParams().set('telephone', telephone);
    if (boutiqueId) {
      params = params.set('boutique_id', boutiqueId.toString());
    }
    return this.http.get<Client>(`${this.apiUrl}/recherche-telephone`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UN CLIENT
  // DELETE /api/clients/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
