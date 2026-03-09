import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CalendarSlot {
  id?: string;
  psychologistId: string;
  date: string;
  startHour: string;
  patientName?: string;
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private base = environment.apiGatewayUrl;

  constructor(private http: HttpClient) {}

  getForPsychologist(id: string): Observable<CalendarSlot[]> {
    return this.http.get<CalendarSlot[]>(`${this.base}/api/availabilities/psychologist/${id}`);
  }

  create(data: Partial<CalendarSlot>): Observable<CalendarSlot> {
    return this.http.post<CalendarSlot>(`${this.base}/api/availabilities/${data.psychologistId}`, data);
  }
}
