import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';
import { Psychologist } from '../../../core/services/psychologist.service';
import { PsychologistsState, LoadPsychologists, SelectPsychologist } from '../state/psychologists.state';
import { PsychologistCardComponent } from './psychologist-card/psychologist-card.component';
import { DetailsPanelComponent } from './details-panel/details-panel.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'thera-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, PsychologistCardComponent, DetailsPanelComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateX(50px)' })),
      ]),
    ]),
  ],
})
export class BrowseComponent {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private store  = inject(Store);

  private queryParams = toSignal(this.route.queryParams, { initialValue: {} as Params });

  keyword  = linkedSignal<string>(() => this.queryParams()['keyword'] ?? '');
  location = linkedSignal<string>(() => this.queryParams()['location'] ?? '');

  all      = this.store.selectSignal(PsychologistsState.items);
  loading  = this.store.selectSignal(PsychologistsState.loading);
  selected = this.store.selectSignal(PsychologistsState.selected);

  filtered = computed(() => {
    const kw  = this.keyword().toLowerCase();
    const loc = this.location().toLowerCase();
    return this.all().filter((p: Psychologist) => {
      const matchKw  = !kw  || (p.Specialization || '').toLowerCase().includes(kw)  || (p.name || '').toLowerCase().includes(kw);
      const matchLoc = !loc || (p.location || '').toLowerCase().includes(loc);
      return matchKw && matchLoc;
    });
  });

  constructor() {
    effect(() => {
      this.store.dispatch(new LoadPsychologists(this.keyword(), this.location()));
    });
  }

  onFilterChange() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: this.keyword(), location: this.location() },
      replaceUrl: true,
    });
  }

  handleCardSelect(p: Psychologist) {
    this.store.dispatch(new SelectPsychologist(this.selected()?.id === p.id ? null : p.id));
  }
}
