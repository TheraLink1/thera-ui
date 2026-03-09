import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CardInfo {
  brand: string;
  last4: string;
  expiry: string;
  cardholder: string;
}

interface PaymentRecord {
  id: number;
  date: string;
  amount: number;
  status: 'Paid' | 'Not payed';
}

@Component({
  selector: 'thera-client-billings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billings.component.html',
  styleUrl: './billings.component.scss',
})
export class ClientBillingsComponent {
  cardInfo: CardInfo = {
    brand: 'Visa',
    last4: '4242',
    expiry: '12/26',
    cardholder: 'Jan Kowalski',
  };

  payments: PaymentRecord[] = [
    { id: 1, date: '2025-05-01T12:00:00Z', amount: 200, status: 'Paid' },
    { id: 2, date: '2025-04-15T09:30:00Z', amount: 150, status: 'Not payed' },
  ];

  editCard = { ...this.cardInfo };
  dialogOpen = false;

  openDialog() {
    this.editCard = { ...this.cardInfo };
    this.dialogOpen = true;
  }

  saveCard() {
    this.cardInfo = { ...this.editCard };
    this.dialogOpen = false;
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('pl-PL');
  }

  statusColor(s: string) {
    return s === 'Paid' ? '#2b6369' : '#ff9800';
  }
}
