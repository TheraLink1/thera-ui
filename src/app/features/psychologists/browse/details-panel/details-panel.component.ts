import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { CalendarSlot } from '../../../../core/services/availability.service';
import { Psychologist } from '../../../../core/services/psychologist.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'thera-details-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class DetailsPanelComponent implements OnChanges {
  @Input() psychologist!: Psychologist;

  loading = false;
  availability: Record<string, string[]> = {};
  availableDates: string[] = [];
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  constructor(private availabilityService: AvailabilityService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['psychologist'] && this.psychologist) {
      this.loadAvailability();
    }
  }

  loadAvailability() {
    this.loading = true;
    this.selectedDate = null;
    this.selectedTime = null;
    this.availability = {};
    this.availableDates = [];
    this.availabilityService.getForPsychologist(this.psychologist.cognitoId).subscribe({
      next: (slots: CalendarSlot[]) => {
        const map: Record<string, string[]> = {};
        for (const slot of slots) {
          const dateStr = slot.date.slice(0, 10);
          if (!map[dateStr]) map[dateStr] = [];
          map[dateStr].push(slot.startHour);
        }
        this.availability = map;
        this.availableDates = Object.keys(map);
        if (this.availableDates.length > 0) {
          this.selectedDate = new Date(this.availableDates[0]);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  isDateAvailable = (d: Date) => {
    return this.availableDates.includes(format(d, 'yyyy-MM-dd'));
  };

  get formattedDate(): string {
    return this.selectedDate ? format(this.selectedDate, 'yyyy-MM-dd') : '';
  }

  get availableTimes(): string[] {
    if (!this.selectedDate) return [];
    return this.availability[this.formattedDate] ?? [];
  }

  selectTime(t: string) {
    this.selectedTime = t;
  }

  onDateChange(d: Date | null) {
    this.selectedDate = d;
    this.selectedTime = null;
  }

  get stars(): string[] {
    const r = this.psychologist?.rating ?? 0;
    return Array.from({ length: 5 }).map((_, i) => {
      if (i < Math.floor(r)) return 'full';
      if (i === Math.floor(r) && r - Math.floor(r) >= 0.5) return 'half';
      return 'empty';
    });
  }

  get bookingLink(): string {
    if (!this.selectedDate || !this.selectedTime) return '#';
    return `/booking/confirm?psychologistId=${this.psychologist.cognitoId}&date=${this.formattedDate}&time=${this.selectedTime}`;
  }
}
