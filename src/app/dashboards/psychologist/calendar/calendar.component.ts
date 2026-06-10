import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AvailabilityService } from '../../../core/services/availability.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CalendarSlot } from '../../../core/services/availability.service';
import { Appointment } from '../../../core/services/appointment.service';

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

interface Block {
  type: 'availability' | 'appointment';
  startHour: string;
  patientName?: string;
}

@Component({
  selector: 'thera-psych-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsychCalendarComponent {
  private availService = inject(AvailabilityService);
  private apptService  = inject(AppointmentService);
  private auth         = inject(AuthService);

  timeSlots    = generateTimeSlots();
  weekStart    = signal(startOfDay(new Date()));
  blocksByDate = signal<Record<string, Block[]>>({});

  weekDates = computed<Date[]>(() => Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)));

  private _init = toSignal(
    forkJoin([
      this.availService.getForPsychologist(this.auth.getUserId()),
      this.apptService.getForPsychologist(this.auth.getUserId()),
    ]).pipe(
      tap(([slots, appts]) => this.blocksByDate.set(this.buildBlocks(slots, appts)))
    ),
    { initialValue: null }
  );

  private buildBlocks(slots: CalendarSlot[], appts: Appointment[]): Record<string, Block[]> {
    const map: Record<string, Block[]> = {};
    for (const a of appts) {
      const key = a.scheduledAt ? a.scheduledAt.slice(0, 10) : (a.date ?? '').slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push({ type: 'appointment', startHour: a.scheduledAt?.slice(11, 16) ?? '', patientName: a.client?.name });
    }
    for (const s of slots) {
      const key = s.date.slice(0, 10);
      const taken = map[key]?.some((b) => b.startHour === s.startHour && b.type === 'appointment');
      if (!taken) {
        if (!map[key]) map[key] = [];
        map[key].push({ type: 'availability', startHour: s.startHour });
      }
    }
    return map;
  }

  dateKey(d: Date): string {
    return format(d, 'yyyy-MM-dd');
  }

  dayLabel(d: Date): string {
    return format(d, 'EEE, MMM d');
  }

  blockAt(dateKey: string, time: string): Block | null {
    return this.blocksByDate()[dateKey]?.find((b) => b.startHour === time) ?? null;
  }

  prevWeek() {
    const prev = addDays(this.weekStart(), -7);
    if (!isBefore(prev, startOfDay(new Date()))) this.weekStart.set(prev);
  }

  nextWeek() {
    this.weekStart.set(addDays(this.weekStart(), 7));
  }
}
