import { Component, inject, signal, afterNextRender, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ReservationsService } from '../reservations.service';
import type { Reservation } from '../../../shared/models/reservation.model';

@Component({
    selector: "app-my-reservations",
    imports: [RouterLink],
    templateUrl: "./my-reservations.html",
    styleUrl: "./my-reservations.css",
})
export class MyReservationsPage {
    private reservationsService = inject(ReservationsService);
    private destroyRef = inject(DestroyRef)

    readonly loading = signal(true);
    readonly reservations = signal<Reservation[]>([]);

    constructor() {
        afterNextRender(() => {
            this.reservationsService.getMyReservations().pipe(
                catchError(() => of([] as Reservation[])),
                takeUntilDestroyed(this.destroyRef),
            ).subscribe(data => {
                this.reservations.set(data);
                this.loading.set(false);
            });
        });
    }
}