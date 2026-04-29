import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Loan } from '../../shared/models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoansService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/loans`;

  getMyLoans() {
    return this.http.get<Loan[]>(`${this.url}/me`);
  }
}
