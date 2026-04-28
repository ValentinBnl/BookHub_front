import { Component, computed, input, signal } from '@angular/core';
import { Book } from '../../models/book.model';

interface CoverPalette {
  bg: string;
  accent: string;
}

const PALETTES: Record<string, CoverPalette> = {
  ombre:    { bg: '#0E1A2B', accent: '#7A8FA6' },
  carpates: { bg: '#2D1B1B', accent: '#C9A068' },
  '1984':   { bg: '#C4352C', accent: '#F0F0F0' },
  dune:     { bg: '#D6A44A', accent: '#6B3410' },
  sapiens:  { bg: '#F0E6D2', accent: '#1E1E2D' },
  petit:    { bg: '#F4D8A8', accent: '#2C4A6B' },
  etranger: { bg: '#E8E3D8', accent: '#1E1E2D' },
  peste:    { bg: '#6B2C2C', accent: '#E8D5A8' },
  madame:   { bg: '#2B3E2B', accent: '#D4A574' },
  germinal: { bg: '#1A1A1A', accent: '#8B6F47' },
  notre:    { bg: '#4A3828', accent: '#D4B896' },
  orient:   { bg: '#0F2847', accent: '#D4A574' },
};

const DEFAULT_PALETTE: CoverPalette = { bg: '#1F5D4E', accent: '#ABC5A2' };

@Component({
  selector: 'app-book-cover',
  imports: [],
  templateUrl: './book-cover.html',
  styleUrl: './book-cover.css',
})
export class BookCoverComponent {
  book = input.required<Book>();

  imgError = signal(false);

  showImage = computed(() => !!this.book().coverUrl && !this.imgError());

  palette = computed<CoverPalette>(() => PALETTES[this.book().key] ?? DEFAULT_PALETTE);

  authorLastName = computed(() => {
    const parts = this.book().author.split(' ');
    return parts[parts.length - 1].toUpperCase();
  });

  onImgError() {
    this.imgError.set(true);
  }
}
