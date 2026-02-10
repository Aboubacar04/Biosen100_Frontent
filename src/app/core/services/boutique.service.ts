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

  getAll(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(this.apiUrl).pipe(
      tap(data => this.boutiquesSubject.next(data))
    );
  }

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
}
