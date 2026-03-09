import { Component } from '@angular/core';
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
})
export class VerifyFormComponent {
  hourlyRate = '';
  description = '';
  idFile: File | null = null;
  educationFile: File | null = null;
  loading = false;
  success = false;
  error = '';

  constructor(private http: HttpClient) {}

  onIdFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.idFile = input.files?.[0] ?? null;
  }

  onEducationFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.educationFile = input.files?.[0] ?? null;
  }

  submit() {
    this.loading = true;
    this.success = false;
    this.error = '';
    const form = new FormData();
    form.append('hourlyRate', this.hourlyRate);
    form.append('description', this.description);
    if (this.idFile) form.append('idFile', this.idFile);
    if (this.educationFile) form.append('educationProofFile', this.educationFile);
    this.http.post(`${environment.apiGatewayUrl}/api/upgrade-to-psychologist`, form).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.hourlyRate = '';
        this.description = '';
        this.idFile = null;
        this.educationFile = null;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'An unexpected error occurred';
      },
    });
  }
}
