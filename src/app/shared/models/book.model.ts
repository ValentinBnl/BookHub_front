export type BookStatus = 'available' | 'borrowed' | 'upcoming' | 'late';

export interface Book {
  key: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  coverUrl?: string;
  year?: number;
}

export interface BookSummary {
  id: number;
  titre: string;
  auteur: string;
  urlCouverture: string;
  totalExemplaires: number;
  exemplairesDisponibles: number;
  categorie: string;
}

export interface BookPage {
  content: BookSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
