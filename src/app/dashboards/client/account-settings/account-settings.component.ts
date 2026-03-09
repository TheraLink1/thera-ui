import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'thera-client-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class ClientAccountSettingsComponent implements OnInit {
  name = '';
  email = '';
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    this.http.get<{ name: string; email: string }>(`${environment.apiGatewayUrl}/api/clients/${userId}`).subscribe({
      next: (u) => {
        this.name = u.name ?? '';
        this.email = u.email ?? '';
      },
    });
  }

  save() {
    if (!this.name || !this.email) return;
    this.saving = true;
    const userId = this.auth.getUserId();
    this.http.put(`${environment.apiGatewayUrl}/api/clients/${userId}`, { name: this.name, email: this.email }).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Zapisano zmiany!';
        this.messageType = 'success';
      },
      error: () => {
        this.saving = false;
        this.message = 'Nie udało się zapisać zmian.';
        this.messageType = 'error';
      },
    });
  }
}
