import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'thera-psych-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class PsychAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;
  error = false;

  constructor(private service: AppointmentService, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    this.service.getForPsychologist(id).subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      },
    });
  }

  formatDate(d: string): string {
    try {
      return format(new Date(d), 'Pp');
    } catch {
      return d;
    }
  }

  canModify(appt: Appointment): boolean {
    return appt.status === 'PENDING';
  }
}
