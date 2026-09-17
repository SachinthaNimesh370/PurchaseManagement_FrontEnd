import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  PurchaseBillItem,
  PurchaseBillRequest,
  PurchaseBillListResponse,
  ItemSummary
} from '../../shared/models/purchase-bill.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseBillService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly DEFAULT_ITEMS: string[] = [
    'Mango',
    'Apple',
    'Banana',
    'Orange',
    'Grapes',
    'Kiwi',
    'Strawberry'
  ];

  getAll(): Observable<PurchaseBillListResponse> {
    return this.http.get<PurchaseBillListResponse>(`${this.apiUrl}/purchase-bills`);
  }

  create(request: PurchaseBillRequest): Observable<PurchaseBillItem> {
    return this.http.post<PurchaseBillItem>(`${this.apiUrl}/purchase-bills`, request);
  }

  getSummary(): Observable<ItemSummary> {
    return this.http.get<ItemSummary>(`${this.apiUrl}/purchase-bills/summary`);
  }

  getAllowedItems(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/purchase-bills/items`).pipe(
      catchError(() => of(this.DEFAULT_ITEMS))
    );
  }
}
