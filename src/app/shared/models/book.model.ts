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
