import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  Book,
  BookDetail,
  BookFormData,
  BookStats,
  BookStatus,
} from "../../shared/models/book.model";

interface BookSummaryDto {
  id: number;
  titre: string;
  auteur: string;
  urlCouverture: string | null;
  totalExemplaires: number;
  exemplairesDisponibles: number;
  categorie: string;
  dateParution?: string;
}

interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export interface BookPage {
  books: Book[];
  totalPages: number;
  totalElements: number;
}

export type SortField = "titre" | "auteur" | "dateParution";
export type SortDirection = "asc" | "desc";

export interface BookFilter {
  query?: string;
  categorie?: string;
  disponible?: boolean;
  anneeMin?: number;
  anneeMax?: number;
  sortBy?: SortField;
  direction?: SortDirection;
  page?: number;
  size?: number;
}

function toStatus(disponibles: number): BookStatus {
  return disponibles > 0 ? "available" : "borrowed";
}

function toBook(dto: BookSummaryDto): Book {
  return {
    key: dto.id.toString(),
    title: dto.titre,
    author: dto.auteur,
    category: dto.categorie,
    status: toStatus(dto.exemplairesDisponibles),
    coverUrl: dto.urlCouverture ?? undefined,
    year: dto.dateParution ? +String(dto.dateParution).slice(0, 4) : undefined,
    totalCopies: dto.totalExemplaires,
    availableCopies: dto.exemplairesDisponibles,
  };
}

@Injectable({ providedIn: "root" })
export class BookService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/books`;

  getYearRange(): Observable<{ min: number; max: number }> {
    return this.http
      .get<[number, number]>(`${this.url}/years`)
      .pipe(map(([min, max]) => ({ min, max })));
  }

  getBooks(filter: BookFilter = {}): Observable<BookPage> {
    let params = new HttpParams()
      .set("query", filter.query ?? "")
      .set("page", String(filter.page ?? 0))
      .set("size", String(filter.size ?? 8))
      .set("sortBy", filter.sortBy ?? "titre")
      .set("direction", filter.direction ?? "asc");

    if (filter.categorie && filter.categorie !== "Tous") {
      params = params.set("categorie", filter.categorie);
    }
    if (filter.disponible !== undefined) {
      params = params.set("disponible", String(filter.disponible));
    }
    if (filter.anneeMin !== undefined) {
      params = params.set("anneeMin", String(filter.anneeMin));
    }
    if (filter.anneeMax !== undefined) {
      params = params.set("anneeMax", String(filter.anneeMax));
    }

    return this.http
      .get<SpringPage<BookSummaryDto>>(`${this.url}/search`, { params })
      .pipe(
        map((p) => ({
          books: p.content.map(toBook),
          totalPages: p.totalPages,
          totalElements: p.totalElements,
        })),
      );
  }

  getById(id: number): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.url}/${id}`);
  }

  getStats(): Observable<BookStats> {
    return this.http.get<BookStats>(`${this.url}/stats`);
  }

  createBook(data: BookFormData): Observable<BookDetail> {
    return this.http.post<BookDetail>(this.url, data);
  }

  updateBook(id: number, data: BookFormData): Observable<BookDetail> {
    return this.http.put<BookDetail>(`${this.url}/${id}`, data);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
