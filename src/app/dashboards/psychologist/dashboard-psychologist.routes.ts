import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { PsychologistDashboardComponent } from './psychologist-dashboard/psychologist-dashboard.component';
import { PsychAccountSettingsComponent } from './account-settings/account-settings.component';
import { SetAvailabilityComponent } from './set-availability/set-availability.component';
import { PsychAppointmentsComponent } from './appointments/appointments.component';
import { PsychBillingsComponent } from './billings/billings.component';
import { PsychCalendarComponent } from './calendar/calendar.component';
import { PsychRatingsComponent } from './ratings/ratings.component';

export const PSYCHOLOGIST_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: PsychologistDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['psychologist'] },
    children: [
      { path: 'account-settings', component: PsychAccountSettingsComponent },
      { path: 'set-availability', component: SetAvailabilityComponent },
      { path: 'appointments', component: PsychAppointmentsComponent },
      { path: 'billings', component: PsychBillingsComponent },
      { path: 'calendar', component: PsychCalendarComponent },
      { path: 'ratings', component: PsychRatingsComponent },
      { path: '', redirectTo: 'account-settings', pathMatch: 'full' },
    ],
  },
];
