import { Component, signal, computed } from '@angular/core';
import { Book, BookStatus } from '../../../../shared/models/book.model';
import { BookCardComponent } from '../../components/book-card/book-card';
import { IconComponent } from '../../../../shared/components/icon/icon';

type SortOption = 'title-asc' | 'author-asc' | 'year-desc' | 'year-asc';

const BOOKS_PER_PAGE = 8;

const STATUS_LABELS: Record<BookStatus, string> = {
  available: 'Disponible',
  borrowed:  'Emprunté',
  late:      'En retard',
  upcoming:  'Réservé',
};

const ALL_BOOKS: Book[] = [
  { key: 'ombre',    title: "L'ombre du vent",           author: 'Carlos Ruiz Zafón',        category: 'Romans',  year: 2001, pages: 576, status: 'available', language: 'Espagnol' },
  { key: 'carpates', title: 'Le Château des Carpathes',  author: 'Jules Verne',              category: 'Romans',  year: 1892, pages: 240, status: 'available', language: 'Français' },
  { key: '1984',     title: '1984',                      author: 'George Orwell',            category: 'Romans',  year: 1949, pages: 328, status: 'borrowed',  language: 'Anglais'  },
  { key: 'dune',     title: 'Dune',                      author: 'Frank Herbert',            category: 'Romans',  year: 1965, pages: 688, status: 'available', language: 'Anglais'  },
  { key: 'sapiens',  title: 'Sapiens',                   author: 'Yuval Noah Harari',        category: 'Essais',  year: 2011, pages: 512, status: 'available', language: 'Français' },
  { key: 'petit',    title: 'Le Petit Prince',           author: 'Antoine de Saint-Exupéry', category: 'Jeunesse',year: 1943, pages: 96,  status: 'borrowed',  language: 'Français' },
  { key: 'etranger', title: "L'Étranger",                author: 'Albert Camus',             category: 'Romans',  year: 1942, pages: 184, status: 'available', language: 'Français' },
  { key: 'peste',    title: 'La Peste',                  author: 'Albert Camus',             category: 'Romans',  year: 1947, pages: 336, status: 'upcoming',  language: 'Français' },
  { key: 'madame',   title: 'Madame Bovary',             author: 'Gustave Flaubert',         category: 'Romans',  year: 1856, pages: 432, status: 'available', language: 'Français' },
  { key: 'germinal', title: 'Germinal',                  author: 'Émile Zola',               category: 'Romans',  year: 1885, pages: 592, status: 'borrowed',  language: 'Français' },
  { key: 'notre',    title: 'Notre-Dame de Paris',       author: 'Victor Hugo',              category: 'Romans',  year: 1831, pages: 640, status: 'available', language: 'Français' },
  { key: 'orient',   title: "Crime de l'Orient-Express", author: 'Agatha Christie',          category: 'Policier',year: 1934, pages: 256, status: 'available', language: 'Anglais'  },
];

const CATEGORIES = ['Tous', 'Romans', 'BD', 'Essais', 'Jeunesse', 'Policier', 'Poésie', 'Sciences'];

@Component({
  selector: 'app-catalog',
  imports: [BookCardComponent, IconComponent],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  activeCategory  = signal('Tous');
  activeView      = signal<'grid' | 'list'>('grid');
  checkedStatuses = signal<Set<BookStatus>>(new Set<BookStatus>());
  checkedLangs    = signal<Set<string>>(new Set<string>());
  sortBy          = signal<SortOption>('title-asc');
  currentPage     = signal(1);

  categories = CATEGORIES;

  // Compteurs dérivés des données réelles
  availabilityGroups = computed(() => {
    const counts = new Map<BookStatus, number>();
    for (const b of ALL_BOOKS) {
      counts.set(b.status, (counts.get(b.status) ?? 0) + 1);
    }
    return (['available', 'borrowed', 'late', 'upcoming'] as BookStatus[])
      .filter(s => counts.has(s))
      .map(s => ({ status: s, label: STATUS_LABELS[s], count: counts.get(s)! }));
  });

  languageGroups = computed(() => {
    const counts = new Map<string, number>();
    for (const b of ALL_BOOKS) {
      counts.set(b.language, (counts.get(b.language) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([language, count]) => ({ language, count }));
  });

  // Livres filtrés + triés (sans pagination)
  filteredBooks = computed(() => {
    const cat    = this.activeCategory();
    const avail  = this.checkedStatuses();
    const lang   = this.checkedLangs();
    const sort   = this.sortBy();

    const result = ALL_BOOKS.filter(b => {
      if (cat !== 'Tous' && b.category !== cat)        return false;
      if (avail.size > 0 && !avail.has(b.status))      return false;
      if (lang.size > 0  && !lang.has(b.language))     return false;
      return true;
    });

    return result.sort((a, b) => {
      switch (sort) {
        case 'title-asc':  return a.title.localeCompare(b.title, 'fr');
        case 'author-asc': return a.author.localeCompare(b.author, 'fr');
        case 'year-desc':  return b.year - a.year;
        case 'year-asc':   return a.year - b.year;
      }
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredBooks().length / BOOKS_PER_PAGE))
  );

  // Livres de la page courante
  books = computed(() => {
    const start = (this.currentPage() - 1) * BOOKS_PER_PAGE;
    return this.filteredBooks().slice(start, start + BOOKS_PER_PAGE);
  });

  // Boutons de pagination calculés dynamiquement
  paginationPages = computed((): (number | '…')[] => {
    const total   = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) return [];

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

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

  setView(v: 'grid' | 'list') {
    this.activeView.set(v);
  }

  setSort(event: Event) {
    this.sortBy.set((event.target as HTMLSelectElement).value as SortOption);
    this.currentPage.set(1);
  }

  toggleStatus(status: BookStatus) {
    const s = new Set(this.checkedStatuses());
    s.has(status) ? s.delete(status) : s.add(status);
    this.checkedStatuses.set(s);
    this.currentPage.set(1);
  }

  isStatusChecked(status: BookStatus) {
    return this.checkedStatuses().has(status);
  }

  toggleLanguage(language: string) {
    const s = new Set(this.checkedLangs());
    s.has(language) ? s.delete(language) : s.add(language);
    this.checkedLangs.set(s);
    this.currentPage.set(1);
  }

  isLanguageChecked(language: string) {
    return this.checkedLangs().has(language);
  }

  goToPage(p: number | '…') {
    if (typeof p === 'number') this.currentPage.set(p);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

}
