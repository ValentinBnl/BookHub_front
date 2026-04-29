import { Component, computed, inject, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  map,
  of,
  switchMap,
} from "rxjs";
import { BookService, BookFilter } from "../../../../core/services/book";
import { BooksService } from "../../books.service";
import { CategoryService } from "../../../../core/services/category";
import { IconComponent } from "../../../../shared/components/icon/icon";
import { BookCoverComponent } from "../../../../shared/components/book-cover/book-cover";
import type {
  Book,
  BookDetail,
  BookFormData,
  BookStats,
} from "../../../../shared/models/book.model";

interface OpenLibraryBook {
  key?: string;
  title?: string;
  authors?: { name: string }[];
  publish_date?: string;
  number_of_pages?: number;
  cover?: { large?: string; medium?: string; small?: string };
  description?: string | { value: string };
}

interface OpenLibraryEdition {
  works?: { key: string }[];
}

interface OpenLibraryWork {
  description?: string | { value: string };
}

const BOOKS_PER_PAGE = 10;
const EMPTY_PAGE = { books: [] as Book[], totalPages: 1, totalElements: 0 };

@Component({
  selector: "app-librarian-catalog",
  imports: [RouterLink, IconComponent, BookCoverComponent],
  templateUrl: "./librarian-catalog.html",
  styleUrl: "./librarian-catalog.css",
})
export class LibrarianCatalog {
  private bookService = inject(BookService);
  private booksService = inject(BooksService);
  private categoryService = inject(CategoryService);

  searchQuery = signal("");
  activeCategory = signal("Tous");
  currentPage = signal(1);

  showModal = signal(false);
  editingBook = signal<BookDetail | null>(null);
  modalLoading = signal(false);

  formTitre = signal("");
  formAuteur = signal("");
  formIsbn = signal("");
  formDescription = signal("");
  formDateParution = signal("");
  formNombrePages = signal(0);
  formUrlCouverture = signal("");
  formTotalExemplaires = signal(1);
  formCategorieId = signal(0);
  submitting = signal(false);
  formError = signal<string | null>(null);

  isbnLookupLoading = signal(false);
  isbnLookupError = signal<string | null>(null);

  deletingId = signal<number | null>(null);
  deleteError = signal<string | null>(null);

  private readonly reload$ = new BehaviorSubject<void>(undefined);

  filterCategories = toSignal(
    this.categoryService.getAll().pipe(
      map((cats) => ["Tous", ...cats]),
      catchError(() => of(["Tous"])),
    ),
    { initialValue: ["Tous"] },
  );

  categoryOptions = toSignal(
    this.categoryService.getAllWithDetails().pipe(catchError(() => of([]))),
    { initialValue: [] as { id: number; nom: string }[] },
  );

  private filter = computed<BookFilter>(() => ({
    query: this.searchQuery().trim() || undefined,
    categorie: this.activeCategory(),
    page: this.currentPage() - 1,
    size: BOOKS_PER_PAGE,
    sortBy: "titre",
    direction: "asc",
  }));

  private pageData = toSignal(
    combineLatest([toObservable(this.filter), this.reload$]).pipe(
      debounceTime(300),
      switchMap(([f]) =>
        this.bookService.getBooks(f).pipe(catchError(() => of(EMPTY_PAGE))),
      ),
    ),
    { initialValue: EMPTY_PAGE },
  );

  books = computed(() => this.pageData().books);
  totalPages = computed(() => this.pageData().totalPages);
  totalCount = computed(() => this.pageData().totalElements);

  stats = toSignal(
    this.bookService.getStats().pipe(catchError(() => of(null))),
    { initialValue: null as BookStats | null },
  );

  paginationPages = computed((): (number | "…")[] => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) return [];
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (current > 3) pages.push("…");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    )
      pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  });

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.currentPage.set(1);
  }

  setSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  openCreate() {
    this.editingBook.set(null);
    this.resetForm();
    this.showModal.set(true);
  }

  openEdit(book: Book) {
    this.showModal.set(true);
    this.modalLoading.set(true);
    this.editingBook.set(null);
    this.booksService
      .getById(Number(book.key))
      .pipe(catchError(() => of(null)))
      .subscribe((detail) => {
        this.modalLoading.set(false);
        if (detail) {
          this.editingBook.set(detail);
          this.populateForm(detail);
        }
      });
  }

  closeModal() {
    this.showModal.set(false);
  }

  async lookupIsbn() {
    const isbn = this.formIsbn().trim();
    if (!isbn) return;
    this.isbnLookupLoading.set(true);
    this.isbnLookupError.set(null);
    try {
      const bookData = await this.fetchJson<Record<string, OpenLibraryBook>>(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      );
      const book = bookData[`ISBN:${isbn}`];
      if (!book) {
        this.isbnLookupError.set(
          "Aucun livre trouvé pour cet ISBN dans OpenLibrary.",
        );
        return;
      }

      if (book.title) this.formTitre.set(book.title);
      if (book.authors?.length) this.formAuteur.set(book.authors[0].name);
      if (book.number_of_pages) this.formNombrePages.set(book.number_of_pages);
      if (book.cover?.large) this.formUrlCouverture.set(book.cover.large);
      else if (book.cover?.medium)
        this.formUrlCouverture.set(book.cover.medium);
      if (book.publish_date) {
        const parsed = this.parsePublishDate(book.publish_date);
        if (parsed) this.formDateParution.set(parsed);
      }

      // La description peut être absente de l'édition — on remonte au work
      const desc = this.extractText(book.description);
      if (desc) {
        this.formDescription.set(desc);
      } else if (book.key) {
        const workDesc = await this.fetchWorkDescription(book.key);
        if (workDesc) this.formDescription.set(workDesc);
      }
    } catch {
      this.isbnLookupError.set("Impossible de contacter OpenLibrary.");
    } finally {
      this.isbnLookupLoading.set(false);
    }
  }

  private async fetchWorkDescription(
    editionKey: string,
  ): Promise<string | null> {
    try {
      const edition = await this.fetchJson<OpenLibraryEdition>(
        `https://openlibrary.org${editionKey}.json`,
      );
      const workKey = edition.works?.[0]?.key;
      if (!workKey) return null;
      const work = await this.fetchJson<OpenLibraryWork>(
        `https://openlibrary.org${workKey}.json`,
      );
      return this.extractText(work.description);
    } catch {
      return null;
    }
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<T>;
  }

  private extractText(
    value: string | { value: string } | undefined,
  ): string | null {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value.value ?? null;
  }

  private parsePublishDate(raw: string): string | null {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
    return null;
  }

  private resetForm() {
    this.formTitre.set("");
    this.formAuteur.set("");
    this.formIsbn.set("");
    this.formDescription.set("");
    this.formDateParution.set("");
    this.formNombrePages.set(0);
    this.formUrlCouverture.set("");
    this.formTotalExemplaires.set(1);
    this.formCategorieId.set(0);
    this.formError.set(null);
    this.isbnLookupError.set(null);
  }

  private populateForm(detail: BookDetail) {
    this.formTitre.set(detail.titre);
    this.formAuteur.set(detail.auteur);
    this.formIsbn.set(detail.isbn ?? "");
    this.formDescription.set(detail.description ?? "");
    this.formDateParution.set(detail.dateParution?.split("T")[0] ?? "");
    this.formNombrePages.set(detail.nombrePages ?? 0);
    this.formUrlCouverture.set(detail.urlCouverture ?? "");
    this.formTotalExemplaires.set(detail.totalExemplaires ?? 1);
    this.formCategorieId.set(detail.categorieId ?? 0);
    this.formError.set(null);
    this.isbnLookupError.set(null);
  }

  submitForm() {
    if (this.submitting()) return;
    const data: BookFormData = {
      titre: this.formTitre(),
      auteur: this.formAuteur(),
      isbn: this.formIsbn(),
      description: this.formDescription(),
      dateParution: this.formDateParution(),
      nombrePages: this.formNombrePages(),
      urlCouverture: this.formUrlCouverture(),
      totalExemplaires: this.formTotalExemplaires(),
      categorieId: this.formCategorieId(),
    };
    this.submitting.set(true);
    this.formError.set(null);
    const editing = this.editingBook();
    const obs = editing
      ? this.bookService.updateBook(editing.id, data)
      : this.bookService.createBook(data);
    obs.subscribe({
      next: () => {
        this.showModal.set(false);
        this.reload$.next();
      },
      error: () => {
        this.formError.set("Une erreur est survenue. Veuillez réessayer.");
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false),
    });
  }

  confirmDelete(bookKey: string) {
    this.deletingId.set(Number(bookKey));
    this.deleteError.set(null);
  }

  cancelDelete() {
    this.deletingId.set(null);
  }

  executeDelete() {
    const id = this.deletingId();
    if (id === null) return;
    this.bookService.deleteBook(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.reload$.next();
      },
      error: () =>
        this.deleteError.set(
          "Impossible de supprimer ce livre, des emprunts sont peut-être encore actifs dessus.",
        ),
    });
  }

  goToPage(p: number | "…") {
    if (typeof p === "number") this.currentPage.set(p);
  }
  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update((p) => p - 1);
  }
  nextPage() {
    if (this.currentPage() < this.totalPages())
      this.currentPage.update((p) => p + 1);
  }

  availableRatio(book: Book): number {
    if (!book.totalCopies || book.totalCopies === 0) return 0;
    return ((book.availableCopies ?? 0) / book.totalCopies) * 100;
  }
}
