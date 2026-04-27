import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { BookService, BookFilter, SortField, SortDirection } from '../../../../core/services/book';
import { CategoryService } from '../../../../core/services/category';
import { BookCardComponent } from '../../components/book-card/book-card';
import { IconComponent } from '../../../../shared/components/icon/icon';

type SortOption = 'title-asc' | 'author-asc' | 'year-desc' | 'year-asc';

interface AvailabilityOption {
  disponible: boolean;
  label: string;
}

const BOOKS_PER_PAGE = 8;
const YEAR_MIN = 1800;
const YEAR_MAX = new Date().getFullYear();

const EMPTY_PAGE = { books: [], totalPages: 1, totalElements: 0 };

const SORT_MAP: Record<SortOption, { sortBy: SortField; direction: SortDirection }> = {
  'title-asc':  { sortBy: 'titre',        direction: 'asc'  },
  'author-asc': { sortBy: 'auteur',       direction: 'asc'  },
  'year-desc':  { sortBy: 'dateParution', direction: 'desc' },
  'year-asc':   { sortBy: 'dateParution', direction: 'asc'  },
};


const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { disponible: true,  label: 'Disponible'       },
  { disponible: false, label: 'Rupture de stock' },
];

@Component({
  selector: 'app-catalog',
  imports: [BookCardComponent, IconComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  private bookService     = inject(BookService);
  private categoryService = inject(CategoryService);

  activeCategory       = signal('Tous');
  activeView           = signal<'grid' | 'list'>('grid');
  checkedAvailability  = signal<Set<boolean>>(new Set<boolean>());
  sortBy               = signal<SortOption>('title-asc');
  currentPage          = signal(1);
  yearMin = signal(YEAR_MIN);
  yearMax = signal(YEAR_MAX);

  readonly YEAR_MIN = YEAR_MIN;
  readonly YEAR_MAX = YEAR_MAX;

  trackFill = computed(() => {
    const range = YEAR_MAX - YEAR_MIN;
    const l = (((this.yearMin() - YEAR_MIN) / range) * 100).toFixed(1);
    const r = (((this.yearMax() - YEAR_MIN) / range) * 100).toFixed(1);
    return `linear-gradient(to right, #EFEAE0 ${l}%, #1F5D4E ${l}%, #1F5D4E ${r}%, #EFEAE0 ${r}%)`;
  });

  categories = toSignal(
    this.categoryService.getAll().pipe(
      map(cats => ['Tous', ...cats]),
      catchError(() => of(['Tous']))
    ),
    { initialValue: ['Tous'] }
  );

  availabilityOptions = AVAILABILITY_OPTIONS;

  private filter = computed<BookFilter>(() => {
    const checked = this.checkedAvailability();
    // Un seul choix coché → on filtre ; les deux cochés ou aucun → pas de filtre
    const disponible = checked.size === 1 ? [...checked][0] : undefined;

    return {
      categorie:  this.activeCategory(),
      disponible,
      anneeMin:   this.yearMin() > YEAR_MIN ? this.yearMin() : undefined,
      anneeMax:   this.yearMax() < YEAR_MAX ? this.yearMax() : undefined,
      ...SORT_MAP[this.sortBy()],
      page: this.currentPage() - 1,
      size: BOOKS_PER_PAGE,
    };
  });

  private pageData = toSignal(
    toObservable(this.filter).pipe(
      debounceTime(300),
      switchMap(f => this.bookService.getBooks(f).pipe(
        catchError(() => of(EMPTY_PAGE))
      ))
    ),
    { initialValue: EMPTY_PAGE }
  );

  books      = computed(() => this.pageData().books);
  totalPages = computed(() => this.pageData().totalPages);
  totalCount = computed(() => this.pageData().totalElements);
  loading    = computed(() => this.pageData() === EMPTY_PAGE && this.currentPage() === 1);

  paginationPages = computed((): (number | '…')[] => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '…')[] = [1];
    if (current > 3)          pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2)  pages.push('…');
    pages.push(total);
    return pages;
  });

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
  }

  setView(v: 'grid' | 'list') { this.activeView.set(v); }

  setSort(event: Event) {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortOption);
    this.currentPage.set(1);
  }

  toggleAvailability(disponible: boolean) {
    const s = new Set(this.checkedAvailability());
    s.has(disponible) ? s.delete(disponible) : s.add(disponible);
    this.checkedAvailability.set(s);
    this.currentPage.set(1);
  }

  isAvailabilityChecked(disponible: boolean) { return this.checkedAvailability().has(disponible); }

  setYearMin(event: Event) {
    const v = +(event.target as HTMLInputElement).value;
    this.yearMin.set(Math.min(v, this.yearMax()));
    this.currentPage.set(1);
  }

  setYearMax(event: Event) {
    const v = +(event.target as HTMLInputElement).value;
    this.yearMax.set(Math.max(v, this.yearMin()));
    this.currentPage.set(1);
  }

  goToPage(p: number | '…') { if (typeof p === 'number') this.currentPage.set(p); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
}
