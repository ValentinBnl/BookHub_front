import { Component, computed, input } from '@angular/core';
import { BookStatus } from '../../models/book.model';

interface BadgeConfig {
  bg: string;
  fg: string;
  dot: string;
  label: string;
}

@Component({
  selector: 'app-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class BadgeComponent {
  status = input.required<BookStatus>();

  config = computed<BadgeConfig>(() => {
    const configs: Record<BookStatus, BadgeConfig> = {
      available: { bg: '#E3F1E8', fg: '#2E7D5B', dot: '#2E7D5B', label: 'Disponible' },
      borrowed:  { bg: '#FCEBCE', fg: '#8A6014', dot: '#E2A63A', label: 'Emprunté' },
      late:      { bg: '#FBDDDD', fg: '#A32A2B', dot: '#D64546', label: 'En retard' },
      upcoming:  { bg: '#ECE5F5', fg: '#4E3C82', dot: '#705BA6', label: 'Réservé' },
    };
    return configs[this.status()];
  });
}
