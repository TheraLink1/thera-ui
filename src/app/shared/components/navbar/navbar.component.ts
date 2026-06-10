import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'thera-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, TranslocoPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected auth = inject(AuthService);

  login() {
    this.auth.login();
  }

  register() {
    this.auth.register();
  }

  logout() {
    this.auth.logout();
  }
}
