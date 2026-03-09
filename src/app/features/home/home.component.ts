import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'thera-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  keyword = '';
  location = '';

  tiles = [
    {
      title: 'Czym jest TheraLink?',
      desc: 'TheraLink to nowoczesna platforma, która pomaga w łatwy sposób znaleźć specjalistów medycznych online lub stacjonarnie. Dzięki prostemu interfejsowi, możesz umówić wizytę w kilku krokach.',
    },
    {
      title: 'Jak działamy?',
      desc: 'Wyszukuj lekarzy według specjalizacji, lokalizacji lub nazwiska. Przeglądaj profile, sprawdzaj oceny i umawiaj wizyty z wybranym specjalistą – wszystko online lub stacjonarnie.',
    },
    {
      title: 'Dlaczego akurat my?',
      desc: 'TheraLink to szybka, wygodna i bezpieczna usługa umawiania wizyt. Zaufaj naszej bogatej bazie ekspertów i zaoszczędź czas dzięki prostym rozwiązaniom.',
    },
  ];

  testimonials = [
    { name: 'Anna K.', quote: 'TheraLink pomogło mi znaleźć świetnego specjalistę w moim mieście. Cały proces był szybki i intuicyjny!' },
    { name: 'Tomasz M.', quote: 'Cenię sobie możliwość rezerwacji wizyt online. Oszczędzam mnóstwo czasu, a aplikacja jest bardzo prosta w obsłudze.' },
    { name: 'Ewelina Z.', quote: 'Dzięki TheraLink w końcu znalazłam lekarza, który rozumie moje potrzeby. Gorąco polecam!' },
  ];

  faqs = [
    { question: 'Czy korzystanie z TheraLink jest darmowe?', answer: 'Tak, wyszukiwanie lekarzy i przeglądanie profili jest całkowicie darmowe.' },
    { question: 'Czy mogę odwołać umówioną wizytę?', answer: 'Tak, możesz anulować wizytę bezpośrednio z poziomu swojego konta, najlepiej minimum 24 godziny przed terminem.' },
    { question: 'Jakie specjalizacje są dostępne?', answer: 'Na TheraLink znajdziesz szeroki wybór specjalistów – od internistów po psychoterapeutów i dermatologów.' },
  ];

  stats = [
    { value: '25 000+', label: 'Zarejestrowanych pacjentów' },
    { value: '3 500+', label: 'Dostępnych specjalistów' },
    { value: '12 000+', label: 'Umówionych wizyt' },
  ];

  constructor(private router: Router) {}

  handleSearch(e: Event) {
    e.preventDefault();
    const params = new URLSearchParams({ keyword: this.keyword, location: this.location }).toString();
    this.router.navigateByUrl(`/psychologists?${params}`);
  }
}
