import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
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
})
export class PsychCalendarComponent implements OnInit {
  timeSlots = generateTimeSlots();
  weekStart = startOfDay(new Date());
  blocksByDate: Record<string, Block[]> = {};

  constructor(
    private availService: AvailabilityService,
    private apptService: AppointmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    this.availService.getForPsychologist(id).subscribe({
      next: (slots) => this.apptService.getForPsychologist(id).subscribe({
        next: (appts) => this.buildBlocks(slots, appts),
      }),
    });
  }

  buildBlocks(slots: CalendarSlot[], appts: Appointment[]) {
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
    this.blocksByDate = map;
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

  blockAt(dateKey: string, time: string): Block | null {
    return this.blocksByDate[dateKey]?.find((b) => b.startHour === time) ?? null;
  }

  prevWeek() {
    const prev = addDays(this.weekStart, -7);
    if (!isBefore(prev, startOfDay(new Date()))) this.weekStart = prev;
  }

  nextWeek() {
    this.weekStart = addDays(this.weekStart, 7);
  }
}
