import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { LocationItem } from '../../shared/models/purchase-bill.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getLocations(): Observable<LocationItem[]> {
    return this.http.get<LocationItem[]>(`${this.apiUrl}/locations`).pipe(
      catchError(() => {
        // Fallback: use locations saved in sessionStorage from login response
        const stored = sessionStorage.getItem('auth_locations');
        if (stored) {
          try {
            return of(JSON.parse(stored) as LocationItem[]);
          } catch {
            return of([]);
          }
        }
        return of([]);
      })
    );
  }

  getLocationNames(): Observable<string[]> {
    return this.getLocations().pipe(
      map((locations) =>
        locations
          // Backend uses [JsonPropertyName("Location_Name")] so key is exactly 'Location_Name'
          .map((l) => l.Location_Name || '')
          .filter((name) => !!name)
      )
    );
  }

  getLocationCodes(): Observable<{ code: string; name: string }[]> {
    return this.getLocations().pipe(
      map((locations) =>
        locations
          .filter((l) => l.Location_Name)
          .map((l) => ({
            code: l.Location_Code || '',
            name: l.Location_Name || ''
          }))
      )
    );
  }
}
