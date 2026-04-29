export interface Loan {
  id: number;
  titre: string;
  auteur: string;
  urlCouverture: string;
  dateParution: string;
  dateEmprunt: string;
  dateRetourPrevue: string;
  statut: 'EN COURS' | 'RENDU' | 'EN RETARD';
}