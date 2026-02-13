import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ═══════════════════════════════════════════════════════════════
// 🧾 FACTURE INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface Facture {
  id: number;
  commande_id: number;
  numero_facture: string;
  date_facture: string;
  montant_total: string;
  statut: 'active' | 'annulee';
  created_at: string;
  updated_at: string;
  commande?: CommandeFacture;
}

export interface CommandeFacture {
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
  annulee_par: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: ClientFacture;
  employe?: EmployeFacture;
  livreur?: LivreurFacture;
  produits?: ProduitCommandeFacture[];
  boutique?: BoutiqueFacture;
}

export interface ClientFacture {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse: string | null;
  boutique_id: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeFacture {
  id: number;
  nom: string;
  telephone: string;
  photo: string | null;
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface LivreurFacture {
  id: number;
  nom: string;
  telephone: string;
  disponible: boolean;
  boutique_id: number;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProduitCommandeFacture {
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

export interface BoutiqueFacture {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  logo: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedFactures {
  current_page: number;
  data: Facture[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface ResumeFactures {
  date?: string;
  debut_semaine?: string;
  fin_semaine?: string;
  mois?: number;
  annee?: number;
  total_factures: number;
  montant_total: number;
  par_mois?: Array<{ mois: number; total: number; montant: number }>;
}

export interface FacturesAvecResume {
  resume: ResumeFactures;
  factures: PaginatedFactures;
}

// ═══════════════════════════════════════════════════════════════
// 🔧 SERVICE FACTURE
// ═══════════════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class FactureService {
  private apiUrl = 'http://localhost:8000/api/factures';

  constructor(private http: HttpClient) {}

  getAll(
    page: number = 1,
    perPage: number = 15,
    boutiqueId?: number,
    date?: string,
    mois?: number,
    annee?: number
  ): Observable<PaginatedFactures> {
    let params: any = {
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    if (date) params.date = date;
    if (mois) params.mois = mois.toString();
    if (annee) params.annee = annee.toString();

    return this.http.get<PaginatedFactures>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Facture> {
    return this.http.get<Facture>(`${this.apiUrl}/${id}`);
  }

  getByCommande(commandeId: number): Observable<Facture> {
    return this.http.get<Facture>(`http://localhost:8000/api/commandes/${commandeId}/facture`);
  }

  // ─────────────────────────────────────────────────────────────
  // 📅 FACTURES PAR PÉRIODE
  // ─────────────────────────────────────────────────────────────
  aujourdhui(boutiqueId?: number, page: number = 1, perPage: number = 15): Observable<FacturesAvecResume> {
    let params: any = { page: page.toString(), per_page: perPage.toString() };
    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    return this.http.get<FacturesAvecResume>(`${this.apiUrl}/aujourdhui`, { params });
  }

  semaine(boutiqueId?: number, page: number = 1, perPage: number = 15): Observable<FacturesAvecResume> {
    let params: any = { page: page.toString(), per_page: perPage.toString() };
    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    return this.http.get<FacturesAvecResume>(`${this.apiUrl}/semaine`, { params });
  }

  mois(boutiqueId?: number, mois?: number, annee?: number, page: number = 1, perPage: number = 15): Observable<FacturesAvecResume> {
    let params: any = { page: page.toString(), per_page: perPage.toString() };
    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    if (mois) params.mois = mois.toString();
    if (annee) params.annee = annee.toString();
    return this.http.get<FacturesAvecResume>(`${this.apiUrl}/mois`, { params });
  }

  annee(boutiqueId?: number, annee?: number, page: number = 1, perPage: number = 15): Observable<FacturesAvecResume> {
    let params: any = { page: page.toString(), per_page: perPage.toString() };
    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    if (annee) params.annee = annee.toString();
    return this.http.get<FacturesAvecResume>(`${this.apiUrl}/annee`, { params });
  }

  // ─────────────────────────────────────────────────────────────
  // 🔍 RECHERCHE
  // ─────────────────────────────────────────────────────────────
  search(search: string, boutiqueId?: number, page: number = 1): Observable<PaginatedFactures> {
    let params: any = { search, page: page.toString(), per_page: '15' };
    if (boutiqueId) params.boutique_id = boutiqueId.toString();
    return this.http.get<PaginatedFactures>(`${this.apiUrl}/search`, { params });
  }
}
