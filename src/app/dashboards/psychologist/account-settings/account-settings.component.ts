import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Psychologist } from '../../../core/services/psychologist.service';

@Component({
  selector: 'thera-psych-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class PsychAccountSettingsComponent implements OnInit {
  form = { name: '', Specialization: '', location: '', hourlyRate: 0, Description: '' };
  saving = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  psychologist: Psychologist | null = null;

  constructor(private service: PsychologistService, private auth: AuthService) {}

  ngOnInit() {
    const id = this.auth.getUserId();
    this.service.getById(id).subscribe({
      next: (p) => {
        this.psychologist = p;
        this.form = {
          name: p.name ?? '',
          Specialization: p.Specialization ?? '',
          location: p.location ?? '',
          hourlyRate: p.hourlyRate ?? 0,
          Description: p.Description ?? '',
        };
      },
    });
  }

  save() {
    this.saving = true;
    const id = this.auth.getUserId();
    this.service.update(id, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Settings saved successfully.';
        this.messageType = 'success';
      },
      error: () => {
        this.saving = false;
        this.message = 'Error saving settings. Please try again.';
        this.messageType = 'error';
      },
    });
  }

  get rating() {
    return this.psychologist?.rating ?? 0;
  }

  get ratingStars() {
    return Array.from({ length: 5 }).map((_, i) => (i < Math.round(this.rating) ? 'full' : 'empty'));
  }
}
