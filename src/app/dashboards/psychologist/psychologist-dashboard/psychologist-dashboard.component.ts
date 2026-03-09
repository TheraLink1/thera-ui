import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'thera-psychologist-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './psychologist-dashboard.component.html',
  styleUrl: './psychologist-dashboard.component.scss',
})
export class PsychologistDashboardComponent {}
