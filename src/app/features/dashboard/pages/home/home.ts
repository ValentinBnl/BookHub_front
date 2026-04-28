import { Component, inject, signal, computed, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { IconComponent, type IconName } from '../../../../shared/components/icon/icon';
import { BooksService } from '../../../books/books.service';
import type { BookSummary, Book, BookStatus } from '../../../../shared/models/book.model';
import { BookCardComponent } from '../../../books/components/book-card/book-card';

interface StatCard {
  icon: IconName;
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, BookCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private booksService = inject(BooksService);
  private destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly books = signal<BookSummary[]>([]);
  readonly booksForDetails = computed<Book[]>(() =>
    this.books().map(book => ({
      key: book.id.toString(),
      title: book.titre,
      author: book.auteur,
      category: book.categorie,
      status: (book.exemplairesDisponibles > 0 ? 'available' : 'borrowed') as BookStatus,
      coverUrl: book.urlCouverture || undefined,
    }))
  );

  constructor() {
    afterNextRender(() => {
      this.booksService.getAll(0, 5).pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(data => {
        this.books.set(data?.content ?? []);
        this.loading.set(false);
      });
    });
  }

  readonly stats: StatCard[] = [
    { icon: 'bookmark', value: '3', label: 'Emprunts en cours' },
    { icon: 'heart', value: '12', label: 'Livres favoris' },
    { icon: 'book', value: '18', label: 'Lus cette année' },
    { icon: 'clock', value: '4 j', label: 'À retourner sous' },
  ];

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
