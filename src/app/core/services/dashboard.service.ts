import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Periode = 'jour' | 'semaine' | 'mois' | 'annee';

export interface DashboardStats {
  jour:   { ventes: number; depenses: number; benefice: number; nombre_commandes: number };
  mois:   { ventes: number; depenses: number; benefice: number; nombre_commandes: number };
  annee:  { ventes: number; depenses: number; benefice: number };
  commandes_en_cours: number;
}

export interface EvolutionVente {
  date: string;
  ventes: number;
  nombre_commandes: number;
}

export interface CommandeJour {
  jour: string;
  date: string;
  nombre_commandes: number;
  total_ventes: number;
}

export interface TopProduit {
  id: number;
  nom: string;
  image: string | null;
  quantite_vendue: number;
  total_ventes: number;
}

export interface TopEmploye {
  employe_id: number;
  nom: string;
  photo: string | null;
  nombre_commandes: number;
  total_ventes: number;
}

export interface TopLivreur {
  livreur_id: number;
  nom: string;
  telephone: string;
  nombre_livraisons: number;
  total_livraisons: number;
}

export interface StockFaible {
  id: number;
  nom: string;
  stock: number;
  seuil_alerte: number;
  prix_vente: number;
  categorie: { id: number; nom: string };
}

export interface StatsEmployeCommande {
  id: number;
  numero_commande: string;
  boutique_id: number;
  client_id: number | null;
  employe_id: number;
  livreur_id: number | null;
  type_commande: string;
  statut: string;
  total: string;
  date_commande: string;
  date_validation: string | null;
  date_annulation: string | null;
  raison_annulation: string | null;
  annulee_par: any;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client: {
    id: number;
    nom_complet: string;
    telephone: string;
    adresse: string;
    boutique_id: number;
    created_at: string;
    updated_at: string;
  } | null;
}

export interface StatsEmploye {
  nombre_commandes: number;
  total_ventes: string;
  commandes: {
    current_page: number;
    data: StatsEmployeCommande[];
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
  };
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = 'http://localhost:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  private params(boutiqueId?: number | null, extra: Record<string, any> = {}): HttpParams {
    let p = new HttpParams();
    if (boutiqueId) p = p.set('boutique_id', boutiqueId);
    Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) p = p.set(k, v); });
    return p;
  }

  getStats(boutiqueId?: number | null): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/stats`, { params: this.params(boutiqueId) });
  }

  getEvolutionVentes(boutiqueId?: number | null): Observable<EvolutionVente[]> {
    return this.http.get<EvolutionVente[]>(`${this.api}/evolution-ventes`, { params: this.params(boutiqueId) });
  }

  getCommandesSemaine(boutiqueId?: number | null): Observable<CommandeJour[]> {
    return this.http.get<CommandeJour[]>(`${this.api}/commandes-semaine`, { params: this.params(boutiqueId) });
  }

  getTopProduits(periode: Periode = 'mois', limit = 5, boutiqueId?: number | null): Observable<TopProduit[]> {
    return this.http.get<TopProduit[]>(`${this.api}/top-produits`, { params: this.params(boutiqueId, { periode, limit }) });
  }

  getTopEmployes(periode: Periode = 'mois', limit = 5, boutiqueId?: number | null): Observable<TopEmploye[]> {
    return this.http.get<TopEmploye[]>(`${this.api}/top-employes`, { params: this.params(boutiqueId, { periode, limit }) });
  }

  getTopLivreurs(periode: Periode = 'mois', limit = 5, boutiqueId?: number | null): Observable<TopLivreur[]> {
    return this.http.get<TopLivreur[]>(`${this.api}/top-livreurs`, { params: this.params(boutiqueId, { periode, limit }) });
  }

  getStockFaible(boutiqueId?: number | null): Observable<StockFaible[]> {
    return this.http.get<StockFaible[]>(`${this.api}/stock-faible`, { params: this.params(boutiqueId) });
  }

  // ─────────────────────────────────────────────────────────────
  // 📊 STATS EMPLOYÉ
  // GET /api/dashboard/stats-employe/{employe}?periode=&search=&per_page=&page=
  // ─────────────────────────────────────────────────────────────
  getStatsEmploye(
    employeId: number,
    periode: Periode = 'mois',
    boutiqueId?: number | null,
    search?: string,
    perPage: number = 15,
    page: number = 1
  ): Observable<StatsEmploye> {
    return this.http.get<StatsEmploye>(`${this.api}/stats-employe/${employeId}`, {
      params: this.params(boutiqueId, { periode, search, per_page: perPage, page })
    });
  }
}
