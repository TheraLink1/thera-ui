import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';
import { AppointmentsState, LoadClientAppointments } from '../state/appointments.state';

@Component({
  selector: 'thera-appointment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentHistoryComponent {
  private store = inject(Store);
  private auth  = inject(AuthService);

  appointments = this.store.selectSignal(AppointmentsState.items);
  loading      = this.store.selectSignal(AppointmentsState.loading);

  constructor() {
    effect(() => {
      const id = this.auth.getUserId();
      if (id) this.store.dispatch(new LoadClientAppointments(id));
    });
  }

  isModifiable(appt: Appointment): boolean {
    return appt.status === 'PENDING' || appt.status === 'APPROVED';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleString('pl-PL');
  }
}
