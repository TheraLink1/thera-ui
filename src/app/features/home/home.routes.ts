import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { HomeComponent } from './home.component';

export const HOME_ROUTES: Routes = [
  { path: '', component: HomeComponent, providers: [provideTranslocoScope('home')] }
];
