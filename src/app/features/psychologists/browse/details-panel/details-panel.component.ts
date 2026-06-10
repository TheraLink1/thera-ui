import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { Psychologist } from '../../../../core/services/psychologist.service';
import { AppointmentSlotPickerComponent } from '../../../booking/appointment-slot-picker/appointment-slot-picker.component';

@Component({
  selector: 'thera-details-panel',
  standalone: true,
  imports: [CommonModule, AppointmentSlotPickerComponent],
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

  private router = inject(Router);

  stars = computed(() => {
    const r = this.psychologist()?.rating ?? 0;
    return Array.from({ length: 5 }).map((_, i) => {
      if (i < Math.floor(r)) return 'full';
      if (i === Math.floor(r) && r - Math.floor(r) >= 0.5) return 'half';
      return 'empty';
    });
  });

  onSlotSelected(slot: { date: string; startHour: string }) {
    this.router.navigate(['/booking/confirm'], {
      queryParams: {
        psychologistId: this.psychologist().cognitoId,
        date: slot.date,
        time: slot.startHour,
      },
    });
  }
}
