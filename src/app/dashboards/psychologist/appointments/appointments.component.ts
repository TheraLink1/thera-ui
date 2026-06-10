import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { Store } from '@ngxs/store';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';
import { AppointmentsState, LoadPsychologistAppointments } from '../../client/state/appointments.state';

@Component({
  selector: 'thera-psych-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsychAppointmentsComponent {
  private store = inject(Store);
  private auth  = inject(AuthService);

  appointments = this.store.selectSignal(AppointmentsState.items);
  loading      = this.store.selectSignal(AppointmentsState.loading);
  error        = signal(false);

  constructor() {
    effect(() => {
      const id = this.auth.getUserId();
      if (id) this.store.dispatch(new LoadPsychologistAppointments(id));
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
