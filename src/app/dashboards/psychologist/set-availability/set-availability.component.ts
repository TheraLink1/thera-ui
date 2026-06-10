import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { firstValueFrom } from 'rxjs';
import { AvailabilityService } from '../../../core/services/availability.service';
import { AuthService } from '../../../core/auth/auth.service';

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 15) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

@Component({
  selector: 'thera-set-availability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './set-availability.component.html',
  styleUrl: './set-availability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetAvailabilityComponent {
  private service = inject(AvailabilityService);
  private auth    = inject(AuthService);

  timeSlots   = generateTimeSlots();
  weekStart   = signal(startOfDay(new Date()));
  availability = signal<Record<string, string[]>>({});
  saving      = signal(false);
  saveSuccess = signal(false);
  saveError   = signal(false);

  today     = computed(() => startOfDay(new Date()));
  weekDates = computed<Date[]>(() => Array.from({ length: 7 }, (_, i) => addDays(this.weekStart(), i)));

  dateKey(d: Date): string {
    return format(d, 'yyyy-MM-dd');
  }

  dayLabel(d: Date): string {
    return format(d, 'EEE, MMM d');
  }

  isPast(d: Date): boolean {
    return isBefore(d, this.today());
  }

  isSelected(dateKey: string, time: string): boolean {
    return (this.availability()[dateKey] ?? []).includes(time);
  }

  toggle(dateKey: string, time: string) {
    const idx = this.timeSlots.indexOf(time);
    if (idx < 0 || idx + 3 >= this.timeSlots.length) return;
    const block = [this.timeSlots[idx], this.timeSlots[idx + 1], this.timeSlots[idx + 2], this.timeSlots[idx + 3]];
    const current = this.availability()[dateKey] ?? [];
    const allSelected = block.every((s) => current.includes(s));
    if (allSelected) {
      this.availability.update(a => ({ ...a, [dateKey]: current.filter((s) => !block.includes(s)) }));
    } else {
      const overlap = block.some((s) => current.includes(s));
      if (!overlap) {
        this.availability.update(a => ({ ...a, [dateKey]: [...new Set([...current, ...block])] }));
      }
    }
  }

  prevWeek() {
    const prev = addDays(this.weekStart(), -7);
    if (!isBefore(prev, this.today())) this.weekStart.set(prev);
  }

  nextWeek() {
    this.weekStart.set(addDays(this.weekStart(), 7));
  }

  async save() {
    const id = this.auth.getUserId();
    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(false);
    const entries = Object.entries(this.availability());
    let ok = true;
    for (const [date, slots] of entries) {
      for (const startHour of slots) {
        try {
          await firstValueFrom(this.service.create({ psychologistId: id, date, startHour }));
        } catch {
          ok = false;
        }
      }
    }
    this.saving.set(false);
    this.saveSuccess.set(ok);
    this.saveError.set(!ok);
    if (ok) this.availability.set({});
  }
}
