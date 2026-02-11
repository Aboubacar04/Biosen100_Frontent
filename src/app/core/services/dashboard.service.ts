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
}
