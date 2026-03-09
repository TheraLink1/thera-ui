import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Psychologist } from '../../../../core/services/psychologist.service';

@Component({
  selector: 'thera-psychologist-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './psychologist-card.component.html',
  styleUrl: './psychologist-card.component.scss',
})
export class PsychologistCardComponent {
  @Input() psychologist!: Psychologist;
  @Output() selected = new EventEmitter<Psychologist>();

  select() {
    this.selected.emit(this.psychologist);
  }
}
