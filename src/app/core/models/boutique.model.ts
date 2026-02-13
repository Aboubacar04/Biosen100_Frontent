// ═══════════════════════════════════════════════════════════════
// 🏪 BOUTIQUE MODEL
// ═══════════════════════════════════════════════════════════════

export interface Boutique {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
  logo: string | null;
  actif: boolean;
  created_at: string;
  updated_at: string;

  // Pour la liste (withCount)
  produits_count?: number;
  commandes_count?: number;
  employes_count?: number;

  // Pour le détail (relations)
  produits?: Produit[];
  employes?: Employe[];
  livreurs?: Livreur[];

  // ✅ CLIENTS PAGINÉS (au lieu de clients[])
  clients_paginated?: PaginatedClients;
}

// ═══════════════════════════════════════════════════════════════
// 📄 PAGINATION INTERFACE (Laravel standard)
// ═══════════════════════════════════════════════════════════════

export interface PaginatedClients {
  current_page: number;
  data: Client[];
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

// ═══════════════════════════════════════════════════════════════
// 📦 PRODUIT (pour relation boutique)
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// 👷 EMPLOYE (pour relation boutique)
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// 🚚 LIVREUR (pour relation boutique)
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

// ═══════════════════════════════════════════════════════════════
// 👥 CLIENT (pour relation boutique)
// ═══════════════════════════════════════════════════════════════

export interface Client {
  id: number;
  nom_complet: string;
  telephone: string;
  adresse: string | null;
  boutique_id: number;
  created_at: string;
  updated_at: string;
}
