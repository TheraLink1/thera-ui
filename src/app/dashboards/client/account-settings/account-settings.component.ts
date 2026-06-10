import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'thera-client-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientAccountSettingsComponent {
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  name        = signal('');
  email       = signal('');
  saving      = signal(false);
  message     = signal('');
  messageType = signal<'success' | 'error'>('success');

  private _init = toSignal(
    this.http
      .get<{ name: string; email: string }>(`${environment.apiGatewayUrl}/api/clients/${this.auth.getUserId()}`)
      .pipe(tap(u => {
        this.name.set(u.name ?? '');
        this.email.set(u.email ?? '');
      })),
    { initialValue: null }
  );

  save() {
    if (!this.name() || !this.email()) return;
    this.saving.set(true);
    const userId = this.auth.getUserId();
    this.http
      .put(`${environment.apiGatewayUrl}/api/clients/${userId}`, { name: this.name(), email: this.email() })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.message.set('Zapisano zmiany!');
          this.messageType.set('success');
        },
        error: () => {
          this.saving.set(false);
          this.message.set('Nie udało się zapisać zmian.');
          this.messageType.set('error');
        },
      });
  }
}
