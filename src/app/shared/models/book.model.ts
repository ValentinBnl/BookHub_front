export type BookStatus = "available" | "borrowed" | "upcoming" | "late";

export interface Book {
  key: string;
  title: string;
  author: string;
  category: string;
  status: BookStatus;
  coverUrl?: string;
  year?: number;
  totalCopies?: number;
  availableCopies?: number;
}

export interface BookFormData {
  titre: string;
  auteur: string;
  isbn: string;
  description: string;
  dateParution: string;
  nombrePages: number;
  urlCouverture: string;
  totalExemplaires: number;
  categorieId: number;
}

export interface BookStats {
  totalTitres: number;
  totalExemplaires: number;
  disponibles: number;
  enPret: number;
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

export interface BookDetail {
  id: number;
  titre: string;
  auteur: string;
  isbn: string;
  description: string;
  dateParution: string;
  nombrePages: number;
  urlCouverture: string;
  totalExemplaires: number;
  exemplairesDisponibles: number;
  categorie: string;
  categorieId?: number;
}
