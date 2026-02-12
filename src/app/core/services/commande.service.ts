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
}

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
  pivot?: {
    commande_id: number;
    produit_id: number;
    quantite: number;
    prix_unitaire: string;
    sous_total: string;
    created_at: string;
    updated_at: string;
  };
}

export interface Facture {
  id: number;
  commande_id: number;
  numero_facture: string;
  date_facture: string;
  montant_total: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnnulation {
  id: number;
  nom: string;
  email: string;
  role: string;
  boutique_id: number | null;
  photo: string | null;
  actif: number;
}

export interface Commande {
  id: number;
  numero_commande: string;
  boutique_id: number;
  client_id: number | null;
  employe_id: number;
  livreur_id: number | null;
  type_commande: 'sur_place' | 'livraison';
  statut: 'en_cours' | 'validee' | 'annulee';
  total: string;
  date_commande: string;
  date_validation: string | null;
  date_annulation: string | null;
  raison_annulation: string | null;
  annulee_par: UserAnnulation | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: Client | null;
  employe?: Employe;
  livreur?: Livreur | null;
  produits?: Produit[];
  facture?: Facture;
  boutique?: any;
}

export interface PaginatedCommandes {
  current_page: number;
  data: Commande[];
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

export interface HistoriqueResponse {
  resume: {
    date: string;
    total_commandes: number;
    somme_totale: string;
    total_validees: string;
    nb_en_cours: number;
    nb_annulees: number;
  };
  commandes: PaginatedCommandes;
}

export interface CommandeEmployeResumeItem {
  id: number;
  statut: 'en_cours' | 'validee' | 'annulee';
  total: string;
  type_commande: string;
  notes: string | null;
  heure: string;
  client: {
    id: number;
    nom_complet: string;
    telephone: string;
  } | null;
  livreur: {
    id: number;
    nom: string;
  } | null;
  produits: Array<{
    id: number;
    nom: string;
    quantite: number;
    prix_unitaire: string;
    sous_total: string;
  }>;
}

export interface CommandeEmployeResponse {
  employe: {
    id: number;
    nom: string;
    telephone: string;
  } | null;
  date: string;
  resume: {
    total_commandes: number;
    commandes_validees: number;
    commandes_en_cours: number;
    commandes_annulees: number;
    total_ventes: number;
  };
  commandes: CommandeEmployeResumeItem[];
}

export interface CreateCommandePayload {
  boutique_id?: number;
  client_id?: number | null;
  employe_id: number;
  livreur_id?: number | null;
  type_commande: 'sur_place' | 'livraison';
  notes?: string;
  produits: Array<{
    produit_id: number;
    quantite: number;
  }>;
}

export interface UpdateCommandePayload {
  client_id?: number | null;
  employe_id?: number;
  livreur_id?: number | null;
  type_commande?: 'sur_place' | 'livraison';
  notes?: string;
  produits?: Array<{
    produit_id: number;
    quantite: number;
  }>;
}

export interface ValiderCommandeResponse {
  message: string;
  impression: {
    numero_facture: string;
    date_emission: string;
    boutique: {
      nom: string;
      adresse: string;
      telephone: string;
    };
    client: {
      nom: string;
      telephone: string;
    } | null;
    type_commande: string;
    produits: Array<{
      nom: string;
      quantite: number;
      prix_unitaire: string;
      sous_total: string;
    }>;
    total: string;
    notes: string | null;
  };
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = 'http://localhost:8000/api/commandes';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUTES LES COMMANDES
  // GET /api/commandes?boutique_id=&statut=&date=&per_page=
  // ─────────────────────────────────────────────────────────────
  getAll(filters?: {
    boutique_id?: number;
    statut?: string;
    date?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedCommandes> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedCommandes>(this.apiUrl, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ⏳ COMMANDES EN COURS
  // GET /api/commandes/en-cours?boutique_id=&per_page=
  // ─────────────────────────────────────────────────────────────
  getEnCours(filters?: {
    boutique_id?: number;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedCommandes> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedCommandes>(`${this.apiUrl}/en-cours`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ COMMANDES VALIDÉES
  // GET /api/commandes/validees?boutique_id=&date=&mois=&annee=&per_page=
  // ─────────────────────────────────────────────────────────────
  getValidees(filters?: {
    boutique_id?: number;
    date?: string;
    mois?: number;
    annee?: number;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedCommandes> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.mois) params = params.set('mois', filters.mois.toString());
    if (filters?.annee) params = params.set('annee', filters.annee.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedCommandes>(`${this.apiUrl}/validees`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // ❌ COMMANDES ANNULÉES
  // GET /api/commandes/annulees?boutique_id=&per_page=
  // ─────────────────────────────────────────────────────────────
  getAnnulees(filters?: {
    boutique_id?: number;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedCommandes> {
    let params = new HttpParams();
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedCommandes>(`${this.apiUrl}/annulees`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 📅 HISTORIQUE PAR DATE
  // GET /api/commandes/historique?date=2026-02-11&boutique_id=&per_page=
  // ─────────────────────────────────────────────────────────────
  getHistorique(date: string, filters?: {
    boutique_id?: number;
    per_page?: number;
    page?: number;
  }): Observable<HistoriqueResponse> {
    let params = new HttpParams().set('date', date);
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<HistoriqueResponse>(`${this.apiUrl}/historique`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 👷 COMMANDES DU JOUR D'UN EMPLOYÉ
  // GET /api/commandes/employe/{employe_id}/du-jour?date=&boutique_id=
  // ─────────────────────────────────────────────────────────────
  getCommandesEmployeDuJour(
    employeId: number,
    filters?: { date?: string; boutique_id?: number }
  ): Observable<CommandeEmployeResponse> {
    let params = new HttpParams();
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());

    return this.http.get<CommandeEmployeResponse>(
      `${this.apiUrl}/employe/${employeId}/du-jour`,
      { params }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UNE COMMANDE
  // POST /api/commandes
  // ─────────────────────────────────────────────────────────────
  create(payload: CreateCommandePayload): Observable<{ message: string; commande: Commande }> {
    return this.http.post<{ message: string; commande: Commande }>(this.apiUrl, payload);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UNE COMMANDE
  // GET /api/commandes/{id}
  // ─────────────────────────────────────────────────────────────
  getById(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UNE COMMANDE EN COURS
  // PUT /api/commandes/{id}
  // ─────────────────────────────────────────────────────────────
  update(
    id: number,
    payload: UpdateCommandePayload
  ): Observable<{ message: string; commande: Commande }> {
    return this.http.put<{ message: string; commande: Commande }>(
      `${this.apiUrl}/${id}`,
      payload
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE COMMANDE EN COURS
  // DELETE /api/commandes/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // ✅ VALIDER UNE COMMANDE
  // POST /api/commandes/{id}/valider
  // ─────────────────────────────────────────────────────────────
  valider(id: number): Observable<ValiderCommandeResponse> {
    return this.http.post<ValiderCommandeResponse>(`${this.apiUrl}/${id}/valider`, {});
  }

  // ─────────────────────────────────────────────────────────────
  // ❌ ANNULER UNE COMMANDE
  // POST /api/commandes/{id}/annuler
  // Body: { raison: string }
  // ─────────────────────────────────────────────────────────────
  annuler(id: number, raison: string): Observable<{ message: string; commande: Commande }> {
    return this.http.post<{ message: string; commande: Commande }>(
      `${this.apiUrl}/${id}/annuler`,
      { raison }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 RECHERCHE COMMANDES
  // GET /api/commandes/search?search=&boutique_id=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  search(search: string, filters?: {
    boutique_id?: number;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedCommandes> {
    let params = new HttpParams().set('search', search);
    if (filters?.boutique_id) params = params.set('boutique_id', filters.boutique_id.toString());
    if (filters?.per_page) params = params.set('per_page', filters.per_page.toString());
    if (filters?.page) params = params.set('page', filters.page.toString());

    return this.http.get<PaginatedCommandes>(`${this.apiUrl}/search`, { params });
  }
}
