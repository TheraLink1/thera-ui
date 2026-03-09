import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
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
})
export class SetAvailabilityComponent implements OnInit {
  timeSlots = generateTimeSlots();
  weekStart = startOfDay(new Date());
  availability: Record<string, string[]> = {};
  saving = false;
  saveSuccess = false;
  saveError = false;

  constructor(private service: AvailabilityService, private auth: AuthService) {}

  ngOnInit() {}

  get today() {
    return startOfDay(new Date());
  }

  get weekDates(): Date[] {
    return Array.from({ length: 7 }, (_, i) => addDays(this.weekStart, i));
  }

  dateKey(d: Date): string {
    return format(d, 'yyyy-MM-dd');
  }

  dayLabel(d: Date): string {
    return format(d, 'EEE, MMM d');
  }

  isPast(d: Date): boolean {
    return isBefore(d, this.today);
  }

  isSelected(dateKey: string, time: string): boolean {
    return (this.availability[dateKey] ?? []).includes(time);
  }

  toggle(dateKey: string, time: string) {
    const idx = this.timeSlots.indexOf(time);
    if (idx < 0 || idx + 3 >= this.timeSlots.length) return;
    const block = [this.timeSlots[idx], this.timeSlots[idx + 1], this.timeSlots[idx + 2], this.timeSlots[idx + 3]];
    const current = this.availability[dateKey] ?? [];
    const allSelected = block.every((s) => current.includes(s));
    if (allSelected) {
      this.availability = { ...this.availability, [dateKey]: current.filter((s) => !block.includes(s)) };
    } else {
      const overlap = block.some((s) => current.includes(s));
      if (!overlap) {
        this.availability = { ...this.availability, [dateKey]: [...new Set([...current, ...block])] };
      }
    }
  }

  prevWeek() {
    const prev = addDays(this.weekStart, -7);
    if (!isBefore(prev, this.today)) this.weekStart = prev;
  }

  nextWeek() {
    this.weekStart = addDays(this.weekStart, 7);
  }

  async save() {
    const id = this.auth.getUserId();
    this.saving = true;
    this.saveSuccess = false;
    this.saveError = false;
    const entries = Object.entries(this.availability);
    let ok = true;
    for (const [date, slots] of entries) {
      for (const startHour of slots) {
        try {
          await this.service.create({ psychologistId: id, date, startHour }).toPromise();
        } catch {
          ok = false;
        }
      }
    }
    this.saving = false;
    this.saveSuccess = ok;
    this.saveError = !ok;
    if (ok) this.availability = {};
  }
}
