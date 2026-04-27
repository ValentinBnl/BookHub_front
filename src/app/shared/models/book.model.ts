export type BookStatus = 'available' | 'borrowed' | 'upcoming' | 'late';

export interface Book {
  key: string;
  title: string;
  author: string;
  category: string;
  year: number;
  pages: number;
  status: BookStatus;
  language: string;
}
