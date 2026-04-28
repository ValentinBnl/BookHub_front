import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BookPage, BookDetail } from '../../shared/models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/books`;

  getAll(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<BookPage>(this.url, { params });
  }

  getById(id: number) {
    return this.http.get<BookDetail>(`${this.url}/${id}`);
  }
}
