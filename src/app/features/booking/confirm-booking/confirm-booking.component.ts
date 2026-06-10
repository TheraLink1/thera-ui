import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Psychologist } from '../../../core/services/psychologist.service';

interface PsychologistResult {
  psychologist: Psychologist | null;
  loading: boolean;
}

@Component({
  selector: 'thera-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './confirm-booking.component.html',
  styleUrl: './confirm-booking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmBookingComponent {
  private route               = inject(ActivatedRoute);
  private router              = inject(Router);
  private snackBar            = inject(MatSnackBar);
  private transloco           = inject(TranslocoService);
  private appointmentService  = inject(AppointmentService);
  private psychologistService = inject(PsychologistService);
  private auth                = inject(AuthService);

  private qp = toSignal(this.route.queryParams, { initialValue: {} as Params });

  date           = computed(() => this.qp()['date'] ?? '');
  time           = computed(() => this.qp()['time'] ?? '');
  psychologistId = computed(() => this.qp()['psychologistId'] ?? '');

  private psychologistResult = toSignal(
    toObservable(this.psychologistId).pipe(
      switchMap(id =>
        id
          ? this.psychologistService.getById(id).pipe(
              map(p => ({ psychologist: p, loading: false }) as PsychologistResult),
              startWith({ psychologist: null, loading: true } as PsychologistResult),
              catchError(() => of({ psychologist: null, loading: false } as PsychologistResult))
            )
          : of({ psychologist: null, loading: false } as PsychologistResult)
      )
    ),
    { initialValue: { psychologist: null, loading: true } as PsychologistResult }
  );

  psychologist = computed(() => this.psychologistResult().psychologist);
  loading      = computed(() => this.psychologistResult().loading);
  description  = signal('');

  canConfirm = computed(() =>
    !!this.psychologist() && !!this.date() && !!this.time() && this.auth.isLoggedIn()
  );

  confirm() {
    if (!this.canConfirm()) return;
    const scheduledAt = `${this.date()}T${this.time()}:00`;
    this.appointmentService
      .create({
        clientKeycloakId: this.auth.getUserId(),
        psychologistKeycloakId: this.psychologistId(),
        scheduledAt,
        durationMinutes: 60,
        description: this.description(),
      })
      .subscribe({
        next: () => {
          this.snackBar.open(this.transloco.translate('booking.success'), 'OK', { duration: 4000 });
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: () => {
          this.snackBar.open(this.transloco.translate('booking.error'), 'OK', { duration: 4000 });
        },
      });
  }
}
