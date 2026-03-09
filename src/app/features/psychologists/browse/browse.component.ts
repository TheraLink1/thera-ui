import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { Psychologist } from '../../../core/services/psychologist.service';
import { PsychologistCardComponent } from './psychologist-card/psychologist-card.component';
import { DetailsPanelComponent } from './details-panel/details-panel.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'thera-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, PsychologistCardComponent, DetailsPanelComponent],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss',
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
export class BrowseComponent implements OnInit {
  keyword = '';
  location = '';
  all: Psychologist[] = [];
  selected: Psychologist | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: PsychologistService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.keyword = params['keyword'] ?? '';
      this.location = params['location'] ?? '';
      this.loadPsychologists();
    });
  }

  loadPsychologists() {
    this.service.getAll(this.keyword, this.location).subscribe({
      next: (data) => (this.all = data),
    });
  }

  get filtered(): Psychologist[] {
    return this.all.filter((p) => {
      const kw = this.keyword.toLowerCase();
      const loc = this.location.toLowerCase();
      const matchKw =
        !kw ||
        (p.Specialization || '').toLowerCase().includes(kw) ||
        (p.name || '').toLowerCase().includes(kw);
      const matchLoc = !loc || (p.location || '').toLowerCase().includes(loc);
      return matchKw && matchLoc;
    });
  }

  onFilterChange() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: this.keyword, location: this.location },
      replaceUrl: true,
    });
  }

  handleCardSelect(p: Psychologist) {
    this.selected = this.selected?.id === p.id ? null : p;
  }
}
