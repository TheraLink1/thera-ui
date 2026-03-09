import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'thera-appointment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.scss',
})
export class AppointmentHistoryComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;

  constructor(private service: AppointmentService, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    this.service.getForClient(id).subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isModifiable(appt: Appointment): boolean {
    return appt.status === 'PENDING' || appt.status === 'APPROVED';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('pl-PL');
  }
}
