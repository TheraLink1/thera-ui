import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Psychologist {
  id: string;
  cognitoId: string;
  name: string;
  Specialization: string;
  location: string;
  hourlyRate: number;
  Description?: string;
  rating?: number;
  coordinates?: { latitude: number; longitude: number };
}

@Injectable({ providedIn: 'root' })
export class PsychologistService {
  private base = environment.apiGatewayUrl;

  constructor(private http: HttpClient) {}

  getAll(keyword?: string, location?: string): Observable<Psychologist[]> {
    const params: Record<string, string> = {};
    if (keyword) params['keyword'] = keyword;
    if (location) params['location'] = location;
    return this.http.get<Psychologist[]>(`${this.base}/api/psychologists`, { params });
  }

  getById(id: string): Observable<Psychologist> {
    return this.http.get<Psychologist>(`${this.base}/api/psychologists/${id}`);
  }

  update(id: string, data: Partial<Psychologist>): Observable<Psychologist> {
    return this.http.put<Psychologist>(`${this.base}/api/psychologists/${id}`, data);
  }
}
