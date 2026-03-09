import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { ConfirmBookingComponent } from './confirm-booking/confirm-booking.component';

export const BOOKING_ROUTES: Routes = [
  { path: 'confirm', component: ConfirmBookingComponent, canActivate: [AuthGuard] }
];
