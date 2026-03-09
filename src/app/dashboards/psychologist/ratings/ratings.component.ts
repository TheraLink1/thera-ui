import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RatingData {
  clientName: string;
  rating: number;
  reviewDate: string;
}

@Component({
  selector: 'thera-psych-ratings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ratings.component.html',
  styleUrl: './ratings.component.scss',
})
export class PsychRatingsComponent {
  reviews: RatingData[] = [
    { clientName: 'Anna Kowalska', rating: 5, reviewDate: '2025-05-20' },
    { clientName: 'Marek Nowak', rating: 4.5, reviewDate: '2025-05-18' },
    { clientName: 'Ewa Wiśniewska', rating: 4, reviewDate: '2025-05-15' },
    { clientName: 'Piotr Zieliński', rating: 3.5, reviewDate: '2025-05-10' },
    { clientName: 'Katarzyna Lewandowska', rating: 5, reviewDate: '2025-05-05' },
  ];

  stars(rating: number): string[] {
    return Array.from({ length: 5 }).map((_, i) => {
      if (i < Math.floor(rating)) return 'full';
      if (i === Math.floor(rating) && rating - Math.floor(rating) >= 0.5) return 'half';
      return 'empty';
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
