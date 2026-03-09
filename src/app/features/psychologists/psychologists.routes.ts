import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/guards/auth.guard';
import { BrowseComponent } from './browse/browse.component';

export const PSYCHOLOGISTS_ROUTES: Routes = [
  { path: '', component: BrowseComponent, canActivate: [AuthGuard] }
];
