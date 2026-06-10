import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Psychologist } from '../../../core/services/psychologist.service';

@Component({
  selector: 'thera-psych-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsychAccountSettingsComponent {
  private service = inject(PsychologistService);
  private auth    = inject(AuthService);

  form = signal({ name: '', Specialization: '', location: '', hourlyRate: 0, Description: '' });
  saving      = signal(false);
  message     = signal('');
  messageType = signal<'success' | 'error'>('success');
  psychologist = signal<Psychologist | null>(null);

  private _init = toSignal(
    this.service.getById(this.auth.getUserId()).pipe(
      tap(p => {
        this.psychologist.set(p);
        this.form.set({
          name: p.name ?? '',
          Specialization: p.Specialization ?? '',
          location: p.location ?? '',
          hourlyRate: p.hourlyRate ?? 0,
          Description: p.Description ?? '',
        });
      })
    ),
    { initialValue: null }
  );

  rating = computed(() => this.psychologist()?.rating ?? 0);
  ratingStars = computed(() =>
    Array.from({ length: 5 }).map((_, i) => (i < Math.round(this.rating()) ? 'full' : 'empty'))
  );

  save() {
    this.saving.set(true);
    const id = this.auth.getUserId();
    this.service.update(id, this.form()).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Settings saved successfully.');
        this.messageType.set('success');
      },
      error: () => {
        this.saving.set(false);
        this.message.set('Error saving settings. Please try again.');
        this.messageType.set('error');
      },
    });
  }
}
