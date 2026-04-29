import { Component, inject, signal, computed, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { LoansService } from '../../loans.service';
import { ReservationsService } from '../../../../features/reservations/reservations.service';
import { BookCoverComponent } from '../../../../shared/components/book-cover/book-cover';
import type { Loan } from '../../../../shared/models/loan.model';
import type { Reservation } from '../../../../shared/models/reservation.model';
import type { Book } from '../../../../shared/models/book.model';

@Component({
  selector: 'app-my-loans',
  imports: [RouterLink, BookCoverComponent, SlicePipe, DatePipe],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css',
})
export class MyLoans {
  private loansService = inject(LoansService);
  private reservationsService = inject(ReservationsService);
  private destroyRef = inject(DestroyRef);

  readonly loans = signal<Loan[]>([]);
  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly activeTab = signal<'loans' | 'reservations'>('loans');
  readonly hasLate = computed(() => this.loans().some(l => l.statut === 'EN RETARD'));
  readonly lateLoans = computed(() => this.loans().filter(l => l.statut === 'EN RETARD'));

  constructor() {
    afterNextRender(() => {
      forkJoin({
        loans: this.loansService.getMyLoans().pipe(catchError(() => of([] as Loan[]))),
        reservations: this.reservationsService.getMyReservations().pipe(catchError(() => of([] as Reservation[]))),
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(({ loans, reservations }) => {
          this.loans.set(loans);
          this.reservations.set(reservations);
          this.loading.set(false);
        });
    });
  }

  toBook(loan: Loan): Book {
    return {
      key: loan.id.toString(),
      title: loan.titre,
      author: loan.auteur,
      category: '',
      status: 'borrowed',
      coverUrl: loan.urlCouverture || undefined,
      year: loan.dateParution ? new Date(loan.dateParution).getFullYear() : undefined,
    };
  }

  getProgress(loan: Loan): number {
    const start = new Date(loan.dateEmprunt).getTime();
    const end = new Date(loan.dateRetourPrevue).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }

  statusLabel(statut: string): string {
    if (statut === 'EN COURS') return 'En cours';
    if (statut === 'EN RETARD') return 'En retard';
    return 'Rendu';
  }

  reservationStatusLabel(status: string): string {
    if (status === 'EN_ATTENTE') return 'En attente';
    if (status === 'DISPONIBLE') return 'Disponible';
    if (status === 'ANNULEE') return 'Annulée';
    return status;
  }

  rankLabel(rank: number): string {
    if (!rank || rank < 1) return '–';
    return rank === 1 ? `${rank}er` : `${rank}ème`;
  }

cancelReservation(id: number): void {
    this.reservationsService.cancel(id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.reservations.update(list => list.filter(r => r.id !== id));
      });
  }

  toReservationBook(r: Reservation): Book {
    return {
      key: String(r.bookId ?? 0),
      title: r.bookTitle ?? '',
      author: '-',
      category: '',
      status: 'borrowed',
      coverUrl: r.urlCouverture ?? undefined,
    };
  }
}