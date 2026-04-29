import { Component, inject, signal, computed, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { IconComponent, type IconName } from '../../../../shared/components/icon/icon';
import { BooksService } from '../../../books/books.service';
import { LoansService } from '../../../loans/loans.service';
import type { BookSummary, Book, BookStatus } from '../../../../shared/models/book.model';
import type { Loan } from '../../../../shared/models/loan.model';
import { BookCardComponent } from '../../../books/components/book-card/book-card';
import { BookCoverComponent } from '../../../../shared/components/book-cover/book-cover';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

interface StatCard {
  icon: IconName;
  value: string;
  label: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, BookCardComponent, BookCoverComponent, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private booksService = inject(BooksService);
  private loansService = inject(LoansService);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  readonly firstName = this.authService.firstName;
  readonly loading = signal(true);
  readonly books = signal<BookSummary[]>([]);
  readonly activeLoans = signal<Loan[]>([]);
  readonly loanCount = signal(0);

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

  readonly stats = computed<StatCard[]>(() => [
    { icon: 'bookmark', value: String(this.loanCount()), label: 'Emprunts en cours' },
    { icon: 'heart', value: '12', label: 'Livres favoris' },
    { icon: 'book', value: '18', label: 'Lus cette année' },
    { icon: 'clock', value: '4 j', label: 'À retourner sous' },
  ]);

  constructor() {
    afterNextRender(() => {
      forkJoin({
        books: this.booksService.getAll(0, 5).pipe(catchError(() => of(null))),
        loans: this.loansService.getMyLoans().pipe(catchError(() => of([]))),
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ books, loans }) => {
          this.books.set(books?.content ?? []);
          const active = loans.filter(l => l.statut === 'EN COURS' || l.statut === 'EN RETARD');
          this.activeLoans.set(active);
          this.loanCount.set(active.length);
          this.loading.set(false);
        });
    });
  }

  toLoanBook(loan: Loan): Book {
    return {
      key: String(loan.id),
      title: loan.titre,
      author: loan.auteur,
      category: '',
      status: 'borrowed',
      coverUrl: loan.urlCouverture ?? undefined,
    };
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
