import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { CalendarSlot } from '../../../../core/services/availability.service';
import { Psychologist } from '../../../../core/services/psychologist.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { input } from '@angular/core';

interface AvailabilityResult {
  loading: boolean;
  availability: Record<string, string[]>;
  availableDates: string[];
}

const emptyResult = (loading: boolean): AvailabilityResult => ({
  loading,
  availability: {},
  availableDates: [],
});

@Component({
  selector: 'thera-details-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './details-panel.component.html',
  styleUrl: './details-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class DetailsPanelComponent {
  psychologist = input.required<Psychologist>();

  private availabilityService = inject(AvailabilityService);

  private availabilityResult = toSignal(
    toObservable(this.psychologist).pipe(
      switchMap(p =>
        this.availabilityService.getForPsychologist(p.cognitoId).pipe(
          map((slots: CalendarSlot[]) => {
            const map: Record<string, string[]> = {};
            for (const slot of slots) {
              const d = slot.date.slice(0, 10);
              if (!map[d]) map[d] = [];
              map[d].push(slot.startHour);
            }
            return { loading: false, availability: map, availableDates: Object.keys(map) } as AvailabilityResult;
          }),
          startWith(emptyResult(true)),
          catchError(() => of(emptyResult(false)))
        )
      )
    ),
    { initialValue: emptyResult(true) }
  );

  loading        = computed(() => this.availabilityResult().loading);
  availability   = computed(() => this.availabilityResult().availability);
  availableDates = computed(() => this.availabilityResult().availableDates);

  selectedDate = linkedSignal<Date | null>(() =>
    this.availableDates().length > 0 ? new Date(this.availableDates()[0]) : null
  );
  selectedTime = signal<string | null>(null);

  formattedDate = computed(() =>
    this.selectedDate() ? format(this.selectedDate()!, 'yyyy-MM-dd') : ''
  );

  availableTimes = computed(() =>
    this.selectedDate() ? (this.availability()[this.formattedDate()] ?? []) : []
  );

  stars = computed(() => {
    const r = this.psychologist()?.rating ?? 0;
    return Array.from({ length: 5 }).map((_, i) => {
      if (i < Math.floor(r)) return 'full';
      if (i === Math.floor(r) && r - Math.floor(r) >= 0.5) return 'half';
      return 'empty';
    });
  });

  isDateAvailable = (d: Date) => {
    return this.availableDates().includes(format(d, 'yyyy-MM-dd'));
  };

  selectTime(t: string) {
    this.selectedTime.set(t);
  }

  onDateChange(d: Date | null) {
    this.selectedDate.set(d);
    this.selectedTime.set(null);
  }
}
