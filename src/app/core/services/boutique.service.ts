import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Boutique } from '../models/boutique.model';

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  private apiUrl = 'http://localhost:8000/api/boutiques';

  // 🔔 Boutique sélectionnée par l'admin
  private selectedBoutiqueSubject = new BehaviorSubject<Boutique | null>(null);
  public selectedBoutique$ = this.selectedBoutiqueSubject.asObservable();

  private boutiquesSubject = new BehaviorSubject<Boutique[]>([]);
  public boutiques$ = this.boutiquesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // 📋 LISTE TOUTES LES BOUTIQUES
  // GET /api/boutiques
  // ─────────────────────────────────────────────────────────────
  getAll(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(this.apiUrl).pipe(
      tap(data => this.boutiquesSubject.next(data))
    );
  }

  // ─────────────────────────────────────────────────────────────
  // ➕ CRÉER UNE BOUTIQUE
  // POST /api/boutiques
  // ─────────────────────────────────────────────────────────────
  create(formData: FormData): Observable<{ message: string; boutique: Boutique }> {
    return this.http.post<{ message: string; boutique: Boutique }>(this.apiUrl, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 👁️ AFFICHER UNE BOUTIQUE (avec relations + pagination clients)
  // GET /api/boutiques/{id}?page=1&per_page=15
  // ─────────────────────────────────────────────────────────────
  getById(id: number, page: number = 1, perPage: number = 15): Observable<Boutique> {
    return this.http.get<Boutique>(`${this.apiUrl}/${id}`, {
      params: {
        page: page.toString(),
        per_page: perPage.toString()
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ✏️ MODIFIER UNE BOUTIQUE
  // PUT /api/boutiques/{id}
  // ─────────────────────────────────────────────────────────────
  update(id: number, formData: FormData): Observable<{ message: string; boutique: Boutique }> {
    // Laravel ne supporte pas PUT avec FormData, on utilise POST avec _method
    formData.append('_method', 'PUT');
    return this.http.post<{ message: string; boutique: Boutique }>(`${this.apiUrl}/${id}`, formData);
  }

  // ─────────────────────────────────────────────────────────────
  // 🗑️ SUPPRIMER UNE BOUTIQUE
  // DELETE /api/boutiques/{id}
  // ─────────────────────────────────────────────────────────────
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 🔄 TOGGLE STATUS (actif/inactif)
  // POST /api/boutiques/{id}/toggle-status
  // ─────────────────────────────────────────────────────────────
  toggleStatus(id: number): Observable<{ message: string; boutique: Boutique }> {
    return this.http.post<{ message: string; boutique: Boutique }>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // ─────────────────────────────────────────────────────────────
  // 🔧 MÉTHODES UTILITAIRES
  // ─────────────────────────────────────────────────────────────

  // Sélectionner une boutique (null = toutes)
  selectBoutique(boutique: Boutique | null): void {
    this.selectedBoutiqueSubject.next(boutique);
  }

  getSelectedBoutique(): Boutique | null {
    return this.selectedBoutiqueSubject.value;
  }

  getSelectedBoutiqueId(): number | null {
    return this.selectedBoutiqueSubject.value?.id ?? null;
  }

  getBoutiques(): Boutique[] {
    return this.boutiquesSubject.value;
  }

  // URL du logo
  getLogoUrl(logo: string | null): string {
    if (!logo) return 'assets/placeholder-store.png';
    return `http://localhost:8000/storage/${logo}`;
  }
}
