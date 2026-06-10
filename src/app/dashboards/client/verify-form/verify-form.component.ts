import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'thera-verify-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-form.component.html',
  styleUrl: './verify-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyFormComponent {
  private http = inject(HttpClient);

  hourlyRate     = signal('');
  description    = signal('');
  idFile         = signal<File | null>(null);
  educationFile  = signal<File | null>(null);
  loading        = signal(false);
  success        = signal(false);
  error          = signal('');

  onIdFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.idFile.set(input.files?.[0] ?? null);
  }

  onEducationFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.educationFile.set(input.files?.[0] ?? null);
  }

  submit() {
    this.loading.set(true);
    this.success.set(false);
    this.error.set('');
    const form = new FormData();
    form.append('hourlyRate', this.hourlyRate());
    form.append('description', this.description());
    if (this.idFile()) form.append('idFile', this.idFile()!);
    if (this.educationFile()) form.append('educationProofFile', this.educationFile()!);
    this.http.post(`${environment.apiGatewayUrl}/api/upgrade-to-psychologist`, form).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.hourlyRate.set('');
        this.description.set('');
        this.idFile.set(null);
        this.educationFile.set(null);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'An unexpected error occurred');
      },
    });
  }
}
