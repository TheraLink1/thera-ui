import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { ClientAccountSettingsComponent } from './account-settings/account-settings.component';
import { AppointmentHistoryComponent } from './appointment-history/appointment-history.component';
import { ClientBillingsComponent } from './billings/billings.component';
import { VerifyFormComponent } from './verify-form/verify-form.component';

export const CLIENT_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ClientDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['client'] },
    children: [
      { path: 'account-settings', component: ClientAccountSettingsComponent },
      { path: 'appointments', component: AppointmentHistoryComponent },
      { path: 'billings', component: ClientBillingsComponent },
      { path: 'verify', component: VerifyFormComponent },
      { path: '', redirectTo: 'account-settings', pathMatch: 'full' },
    ],
  },
];
