import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface Appointment {
  id: string;
  clientKeycloakId: string;
  psychologistKeycloakId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  date?: string;
  patientName?: string;
  description?: string;
  meetingLink?: string;
  payment?: { isPaid: boolean; amount: number; paymentDate: string };
  client?: { id: number; name: string; email: string };
  psychologist?: { name: string; email: string };
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private base = environment.apiGatewayUrl;

  constructor(private http: HttpClient) {}

  create(data: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.base}/api/appointments`, data);
  }

  getForClient(id: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}/api/appointments/clientApts/${id}`);
  }

  getForPsychologist(id: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}/api/appointments/psychologistApts/${id}`);
  }

  update(id: string, data: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.base}/api/appointments/${id}`, data);
  }
}
