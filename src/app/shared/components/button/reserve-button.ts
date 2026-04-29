import { Component, input, inject, signal, computed, afterNextRender, DestroyRef } from "@angular/core";
import { IconComponent } from '../../../shared/components/icon/icon';
import { ReservationsService } from "../../../features/reservations/reservations.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
    selector: 'app-reserve-button',
    standalone: true,
    imports: [IconComponent],
    templateUrl: './reserve-button.html',
    styleUrl: './reserve-button.css',
})
export class ReserveButton {
    bookId = input.required<number>();
    exemplairesDisponibles = input.required<number>();

    private reservationsService = inject(ReservationsService);
    private destroyRef = inject(DestroyRef);

    readonly loading = signal(false);
    readonly done = signal(false);
    readonly errorMsg = signal<string | null>(null);
    readonly noStock = computed(() => this.exemplairesDisponibles() === 0);

    constructor() {
        afterNextRender(() => {
            this.reservationsService.getMyReservations()
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (reservations) => {
                        if (reservations.some(r => r.bookId === this.bookId() && r.status !== 'ANNULEE')) {
                            this.done.set(true);
                        }
                    },
                });
        });
    }

    reserve() {
        if (this.loading() || this.done() || this.noStock()) return;
        this.loading.set(true);
        this.errorMsg.set(null);
        this.reservationsService.reserve(this.bookId()).subscribe({
            next: () => {
                this.done.set(true);
                this.loading.set(false);
            },
            error: (err: HttpErrorResponse) => {
                if (err.status === 409) {
                    this.done.set(true);
                } else {
                    this.errorMsg.set('Vous avez atteint le maximum de 3 emprunts actifs.');
                }
                this.loading.set(false);
            },
        });
    }
}