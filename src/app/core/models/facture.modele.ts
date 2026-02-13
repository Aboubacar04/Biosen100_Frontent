// ═══════════════════════════════════════════════════════════════
// 🧾 FACTURE MODEL
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

  // Relations
  commande?: CommandeFacture;
}

// ═══════════════════════════════════════════════════════════════
// 📦 COMMANDE (pour relation facture)
// ═══════════════════════════════════════════════════════════════

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

  // Relations
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

// ═══════════════════════════════════════════════════════════════
// 📄 PAGINATION INTERFACE
// ═══════════════════════════════════════════════════════════════

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
