import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export interface CategoryDetail {
  id: number;
  nom: string;
}

@Injectable({ providedIn: "root" })
export class CategoryService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/categories`;

  getAll(): Observable<string[]> {
    return this.http.get<string[]>(this.url);
  }

  getAllWithDetails(): Observable<CategoryDetail[]> {
    return this.http.get<CategoryDetail[]>(`${this.url}/details`);
  }
}
