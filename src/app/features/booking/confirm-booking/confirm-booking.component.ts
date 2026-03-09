import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Psychologist } from '../../../core/services/psychologist.service';

@Component({
  selector: 'thera-confirm-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './confirm-booking.component.html',
  styleUrl: './confirm-booking.component.scss',
})
export class ConfirmBookingComponent implements OnInit {
  date = '';
  time = '';
  psychologistId = '';
  psychologist: Psychologist | null = null;
  loading = true;
  description = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.date = params['date'] ?? '';
      this.time = params['time'] ?? '';
      this.psychologistId = params['psychologistId'] ?? '';
      if (this.psychologistId) {
        this.psychologistService.getById(this.psychologistId).subscribe({
          next: (p) => {
            this.psychologist = p;
            this.loading = false;
          },
          error: () => {
            this.psychologist = null;
            this.loading = false;
          },
        });
      } else {
        this.loading = false;
      }
    });
  }

  get canConfirm(): boolean {
    return !!this.psychologist && !!this.date && !!this.time && this.auth.isLoggedIn();
  }

  confirm() {
    if (!this.canConfirm) return;
    const scheduledAt = `${this.date}T${this.time}:00`;
    this.appointmentService
      .create({
        clientKeycloakId: this.auth.getUserId(),
        psychologistKeycloakId: this.psychologistId,
        scheduledAt,
        durationMinutes: 60,
        description: this.description,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Wizyta została zarezerwowana!', 'OK', { duration: 4000 });
          setTimeout(() => this.router.navigate(['/']), 2000);
        },
        error: () => {
          this.snackBar.open('Wystąpił błąd podczas rezerwacji.', 'OK', { duration: 4000 });
        },
      });
  }
}
