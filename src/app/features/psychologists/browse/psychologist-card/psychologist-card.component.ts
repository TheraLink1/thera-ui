import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Psychologist } from '../../../../core/services/psychologist.service';

@Component({
  selector: 'thera-psychologist-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './psychologist-card.component.html',
  styleUrl: './psychologist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PsychologistCardComponent {
  psychologist = input.required<Psychologist>();
  selected = output<Psychologist>();

  select() {
    this.selected.emit(this.psychologist());
  }
}
