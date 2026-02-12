import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  EmployeService,
  Employe,
  PaginatedEmployes,
} from '../../../core/services/employe.service';
import { BoutiqueService } from '../../../core/services/boutique.service';
@Component({
  selector: 'app-employe-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employe-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();
  boutiqueId: number | null = null;
  loading = false;
  employes: Employe[] = [];
  currentPage = 1;
  lastPage = 1;
  total = 0;
  perPage = 15;
  from = 0;
  to = 0;
  searchTerm = '';
  filtreActif: boolean | null = null;
  successMessage = '';
  errorMessage = '';
  showDeleteModal = false;
  employeToDelete: Employe | null = null;
  loadingDelete = false;
  showScrollTop = false;
  constructor(
    private employeService: EmployeService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.boutiqueService.selectedBoutique$
      .pipe(takeUntil(this.destroy$))
      .subscribe((boutique) => {
        this.boutiqueId = boutique?.id ?? null;
        this.resetAndLoad();
      });
    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm = term;
        this.resetAndLoad();
      });
    window.addEventListener('scroll', this.onScroll.bind(this));
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }
  loadEmployes(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const filters: any = {
      boutique_id: this.boutiqueId ?? undefined,
      actif: this.filtreActif,
      search: this.searchTerm || undefined,
      per_page: this.perPage,
      page: this.currentPage,
    };
    this.employeService.getAll(filters).subscribe({
      next: (r: PaginatedEmployes) => {
        this.employes = r.data;
        this.currentPage = r.current_page;
        this.lastPage = r.last_page;
        this.total = r.total;
        this.from = r.from;
        this.to = r.to;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur chargement';
        this.loading = false;
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }
  resetAndLoad(): void {
    this.currentPage = 1;
    this.loadEmployes();
  }
  onSearchChange(term: string): void {
    this.searchSubject$.next(term);
  }
  onFiltreActifChange(value: string): void {
    this.filtreActif = value === 'all' ? null : value === 'true';
    this.resetAndLoad();
  }
  onPerPageChange(value: number): void {
    this.perPage = value;
    this.resetAndLoad();
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEmployes();
      this.scrollToTop();
    }
  }
  get pages(): number[] {
    const delta = 2,
      range: number[] = [];
    for (let i = 1; i <= this.lastPage; i++)
      if (
        i === 1 ||
        i === this.lastPage ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta)
      )
        range.push(i);
    const rangeWithDots: number[] = [];
    let prev: number | null = null;
    for (const i of range) {
      if (prev && i - prev > 1) rangeWithDots.push(-1);
      rangeWithDots.push(i);
      prev = i;
    }
    return rangeWithDots;
  }
  openDeleteModal(e: Employe): void {
    this.employeToDelete = e;
    this.showDeleteModal = true;
    this.cdr.markForCheck();
  }
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.employeToDelete = null;
    this.cdr.markForCheck();
  }
  confirmDelete(): void {
    if (!this.employeToDelete) return;
    this.loadingDelete = true;
    this.cdr.markForCheck();
    this.employeService.delete(this.employeToDelete.id).subscribe({
      next: () => {
        this.successMessage = 'Employé supprimé';
        this.closeDeleteModal();
        this.loadingDelete = false;
        this.loadEmployes();
        this.autoHideMessage('success');
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Erreur suppression';
        this.loadingDelete = false;
        this.closeDeleteModal();
        this.cdr.markForCheck();
        this.autoHideMessage('error');
      },
    });
  }
  autoHideMessage(type: 'success' | 'error'): void {
    setTimeout(() => {
      type === 'success'
        ? (this.successMessage = '')
        : (this.errorMessage = '');
      this.cdr.markForCheck();
    }, 5000);
  }
  onScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
    this.cdr.markForCheck();
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  trackById(_: number, item: Employe): number {
    return item.id;
  }
  trackByPage(_: number, page: number): number {
    return page;
  }
  getInitiales(nom: string): string {
    return nom
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}
