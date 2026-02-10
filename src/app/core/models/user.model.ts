export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'admin' | 'gerant';
  boutique_id: number | null;
  photo: string | null;
  actif: boolean;
  boutique?: {
    id: number;
    nom: string;
    adresse: string;
    telephone: string;
    actif: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  nom: string;
  email: string;
  password: string;
  role: 'admin' | 'gerant';
  boutique_id?: number | null;
  actif?: boolean;
}

export interface UpdateUserRequest {
  nom?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'gerant';
  boutique_id?: number | null;
  actif?: boolean;
}

export interface ChangeRoleRequest {
  role: 'admin' | 'gerant';
  boutique_id?: number | null;
}
