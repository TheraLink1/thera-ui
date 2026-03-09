import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Appointment } from '../../../core/services/appointment.service';

@Component({
  selector: 'thera-psych-billings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billings.component.html',
  styleUrl: './billings.component.scss',
})
export class PsychBillingsComponent implements OnInit {
  appointments: Appointment[] = [];
  dialogOpen = false;
  bankName = '';
  accountNumber = '';
  accountHolder = '';
  cashOutAmount = '';
  amountError = '';
  snackVisible = false;

  constructor(private service: AppointmentService, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    this.service.getForPsychologist(id).subscribe({
      next: (data) => (this.appointments = data),
    });
  }

  get relevant(): Appointment[] {
    return this.appointments.filter((a) => a.status === 'APPROVED' || a.status === 'PENDING');
  }

  get totalEarned(): number {
    return this.relevant.filter((a) => a.payment?.isPaid).reduce((s, a) => s + (a.payment?.amount ?? 0), 0);
  }

  get pendingAmount(): number {
    return this.relevant.filter((a) => a.payment && !a.payment.isPaid).reduce((s, a) => s + (a.payment?.amount ?? 0), 0);
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL');
  }

  openDialog() {
    this.dialogOpen = true;
    this.amountError = '';
  }

  submitCashOut() {
    const amount = parseFloat(this.cashOutAmount);
    if (isNaN(amount) || amount <= 0) {
      this.amountError = 'Please enter a valid amount.';
      return;
    }
    if (amount > this.totalEarned) {
      this.amountError = 'Amount exceeds available balance.';
      return;
    }
    this.dialogOpen = false;
    this.snackVisible = true;
    this.bankName = '';
    this.accountNumber = '';
    this.accountHolder = '';
    this.cashOutAmount = '';
    setTimeout(() => (this.snackVisible = false), 4000);
  }
}
