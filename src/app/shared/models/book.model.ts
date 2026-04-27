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
