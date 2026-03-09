import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)
  },
  {
    path: 'psychologists',
    loadChildren: () => import('./features/psychologists/psychologists.routes').then(m => m.PSYCHOLOGISTS_ROUTES)
  },
  {
    path: 'booking',
    loadChildren: () => import('./features/booking/booking.routes').then(m => m.BOOKING_ROUTES)
  },
  {
    path: 'dashboard/client',
    loadChildren: () => import('./dashboards/client/dashboard-client.routes').then(m => m.CLIENT_DASHBOARD_ROUTES)
  },
  {
    path: 'dashboard/psychologist',
    loadChildren: () => import('./dashboards/psychologist/dashboard-psychologist.routes').then(m => m.PSYCHOLOGIST_DASHBOARD_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
