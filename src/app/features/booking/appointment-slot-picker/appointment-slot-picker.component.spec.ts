import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NEVER, of, throwError } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AppointmentSlotPickerComponent } from './appointment-slot-picker.component';
import { AvailabilityService } from '../../../core/services/availability.service';

const mockSlot = { psychologistId: 'p-1', date: '2026-06-15', startHour: '10:00' };

function buildTestBed(availabilityOverride: Partial<AvailabilityService>) {
  TestBed.configureTestingModule({
    imports: [
      AppointmentSlotPickerComponent,
      TranslocoTestingModule.forRoot({
        langs: {
          en: {
            common: { loading: 'Loading...' },
            booking: {
              selectDate: 'Select date',
              selectTime: 'Available times',
              noSlots: 'No slots',
              sessionDuration: '60 min sessions',
            },
          },
        },
        translocoConfig: { defaultLang: 'en', availableLangs: ['en'] },
      }),
    ],
    providers: [{ provide: AvailabilityService, useValue: availabilityOverride }],
    schemas: [NO_ERRORS_SCHEMA],
  });
}

describe('AppointmentSlotPickerComponent', () => {
  let fixture: ComponentFixture<AppointmentSlotPickerComponent>;
  let component: AppointmentSlotPickerComponent;

  describe('with available slots', () => {
    beforeEach(() => {
      buildTestBed({ getForPsychologist: vi.fn().mockReturnValue(of([mockSlot])) });
      fixture = TestBed.createComponent(AppointmentSlotPickerComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('psychologistId', 'p-1');
      fixture.detectChanges();
    });

    it('renders a time-btn for each available slot', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.time-btn');
      expect(buttons.length).toBe(1);
      expect(buttons[0].textContent.trim()).toBe('10:00');
    });

    it('emits slotSelected with correct date and startHour on click', () => {
      const emitted: { date: string; startHour: string }[] = [];
      component.slotSelected.subscribe((v) => emitted.push(v));

      const btn = fixture.nativeElement.querySelector('.time-btn');
      btn.click();
      fixture.detectChanges();

      expect(emitted).toHaveLength(1);
      expect(emitted[0]).toEqual({ date: '2026-06-15', startHour: '10:00' });
    });

    it('marks clicked slot as selected', () => {
      const btn = fixture.nativeElement.querySelector('.time-btn') as HTMLElement;
      btn.click();
      fixture.detectChanges();

      expect(btn.classList.contains('selected')).toBe(true);
    });
  });

  describe('loading state', () => {
    beforeEach(() => {
      buildTestBed({ getForPsychologist: vi.fn().mockReturnValue(NEVER) });
      fixture = TestBed.createComponent(AppointmentSlotPickerComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('psychologistId', 'p-1');
      fixture.detectChanges();
    });

    it('shows loading indicator while request is pending', () => {
      expect(component.loading()).toBe(true);
      const el = fixture.nativeElement.querySelector('.slot-picker-loading');
      expect(el).not.toBeNull();
    });
  });

  describe('error state', () => {
    beforeEach(() => {
      buildTestBed({
        getForPsychologist: vi.fn().mockReturnValue(throwError(() => new Error('network'))),
      });
      fixture = TestBed.createComponent(AppointmentSlotPickerComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('psychologistId', 'p-1');
      fixture.detectChanges();
    });

    it('does not crash and shows empty state when service errors', () => {
      expect(component.loading()).toBe(false);
      expect(component.availableDates()).toEqual([]);
    });
  });
});
