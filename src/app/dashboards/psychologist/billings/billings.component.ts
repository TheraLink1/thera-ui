import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';
import { AppointmentsState, LoadPsychologistAppointments } from '../../client/state/appointments.state';

@Component({
  selector: 'thera-psych-billings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billings.component.html',
  styleUrl: './billings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsychBillingsComponent {
  private store = inject(Store);
  private auth  = inject(AuthService);

  appointments = this.store.selectSignal(AppointmentsState.items);

  dialogOpen     = signal(false);
  bankName       = signal('');
  accountNumber  = signal('');
  accountHolder  = signal('');
  cashOutAmount  = signal('');
  amountError    = signal('');
  snackVisible   = signal(false);

  relevant = computed(() =>
    this.appointments().filter((a: Appointment) => a.status === 'APPROVED' || a.status === 'PENDING')
  );

  totalEarned = computed(() =>
    this.relevant().filter((a: Appointment) => a.payment?.isPaid).reduce((s, a) => s + (a.payment?.amount ?? 0), 0)
  );

  pendingAmount = computed(() =>
    this.relevant().filter((a: Appointment) => a.payment && !a.payment.isPaid).reduce((s, a) => s + (a.payment?.amount ?? 0), 0)
  );

  constructor() {
    effect(() => {
      const id = this.auth.getUserId();
      if (id) this.store.dispatch(new LoadPsychologistAppointments(id));
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL');
  }

  openDialog() {
    this.dialogOpen.set(true);
    this.amountError.set('');
  }

  submitCashOut() {
    const amount = parseFloat(this.cashOutAmount());
    if (isNaN(amount) || amount <= 0) {
      this.amountError.set('Please enter a valid amount.');
      return;
    }
    if (amount > this.totalEarned()) {
      this.amountError.set('Amount exceeds available balance.');
      return;
    }
    this.dialogOpen.set(false);
    this.snackVisible.set(true);
    this.bankName.set('');
    this.accountNumber.set('');
    this.accountHolder.set('');
    this.cashOutAmount.set('');
    setTimeout(() => this.snackVisible.set(false), 4000);
  }
}
