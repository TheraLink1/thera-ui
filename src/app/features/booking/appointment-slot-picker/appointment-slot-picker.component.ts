import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format } from 'date-fns';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AvailabilityService, CalendarSlot } from '../../../core/services/availability.service';

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
  selector: 'thera-appointment-slot-picker',
  standalone: true,
  imports: [CommonModule, TranslocoModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './appointment-slot-picker.component.html',
  styleUrl: './appointment-slot-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentSlotPickerComponent {
  psychologistId = input.required<string>();
  slotSelected = output<{ date: string; startHour: string }>();

  private availabilityService = inject(AvailabilityService);

  private availabilityResult = toSignal(
    toObservable(this.psychologistId).pipe(
      switchMap(id =>
        this.availabilityService.getForPsychologist(id).pipe(
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

  isDateAvailable = (d: Date) => this.availableDates().includes(format(d, 'yyyy-MM-dd'));

  onDateChange(d: Date | null) {
    this.selectedDate.set(d);
    this.selectedTime.set(null);
  }

  selectTime(t: string) {
    this.selectedTime.set(t);
    this.slotSelected.emit({ date: this.formattedDate(), startHour: t });
  }
}
