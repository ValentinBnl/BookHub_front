export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  urlCouverture: string | null;
  bookTitle: string;
  reservationDate: string;
  rankWaitingList: number;
  status: string;
}
