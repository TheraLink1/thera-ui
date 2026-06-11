# STORY-02: Transloco scopes, komponent AppointmentSlotPicker, testy jednostkowe

> **Repo:** `thera-ui` (Angular 21, standalone components, NGXS 21, Transloco 8, Vitest 4, pnpm)
> **Status:** TODO
> **Zależności:** wymaga ukończonej STORY-01 (sygnały, `inject()`, `OnPush`, `input()`/`output()`)
> **Jak użyć:** uruchom Claude Code w katalogu `/Users/desirecutieqb/IdeaProjects/thera-ui` i poleć realizację tej story (`docs/stories/story-02-transloco-scopes-slot-picker-testy.md`).

---

## Kontekst projektu

TheraLink to platforma rezerwacji wizyt psychologicznych — UI domyślnie po polsku, z pełnym wsparciem angielskiego przez Transloco (`@jsverse/transloco`, konfiguracja w `app.config.ts`: `availableLangs: ['pl','en']`, `defaultLang: 'pl'`, loader `core/i18n/transloco-loader.ts`). Trasy feature'ów są lazy-loadowane przez `loadChildren` w `app.routes.ts`. Dostępności psychologa serwuje `core/services/availability.service.ts` przez bramę API (`environment.apiGatewayUrl`).

**Problemy do rozwiązania:**
1. Tłumaczenia to dwa monolityczne pliki `src/assets/i18n/pl.json` i `en.json` — całość ładuje się na starcie, mimo że trasy są lazy.
2. W `confirm-booking.component.ts` komunikaty snackbara są hardkodowane po polsku („Wizyta została zarezerwowana!", „Wystąpił błąd podczas rezerwacji."), mimo że klucze `booking.success` / `booking.error` istnieją w plikach tłumaczeń.
3. Nie istnieje komponent domenowy wyboru terminu — użytkownik trafia do `confirm-booking` z ręcznie przekazanymi query params `date`/`time`, bez weryfikacji względem dostępności psychologa.
4. Testy jednostkowe praktycznie nie istnieją (jedynie `src/app/app.spec.ts`).

## Tło teoretyczne (dla wykonawcy i autora)

- **Transloco scopes** dzielą tłumaczenia na fragmenty per funkcjonalność: `provideTranslocoScope('booking')` w trasie powoduje, że loader pobiera `assets/i18n/booking/pl.json` dopiero przy wejściu w lazy trasę — pliki tłumaczeń ładują się razem z kodem feature'u, co domyka koncepcję lazy loadingu. Domyślny loader HTTP obsługuje scope automatycznie: parametr `lang` przyjmuje postać `booking/pl`, więc istniejący `TranslocoHttpLoader` (`/assets/i18n/${lang}.json`) nie wymaga zmian.
- **Komponent domenowy** (w odróżnieniu od generycznego komponentu UI) odwzorowuje pojęcie z domeny biznesowej — `AppointmentSlotPicker` enkapsuluje logikę „pokaż wolne terminy psychologa i pozwól wybrać jeden", zamiast rozpraszać ją po stronach.
- **Vitest + TestBed:** projekt używa buildera `ng test` z Vitest. Testy HTTP piszemy z `provideHttpClient()` + `provideHttpClientTesting()` i `HttpTestingController` (asercje na URL/metodę/treść, bez prawdziwej sieci); zależności (Keycloak, Router, serwisy) mockujemy przez `{ provide: X, useValue: ... }`.

## User story

Jako użytkownik chcę wybierać termin wizyty z faktycznych dostępności psychologa i korzystać z aplikacji w wybranym języku, a jako deweloper chcę mieć siatkę testów jednostkowych zabezpieczającą kluczowe elementy (interceptory, guard, stany, serwisy).

## Zakres

**IN:** podział tłumaczeń na scopes, usunięcie hardkodowanych tekstów z TS, nowy komponent `AppointmentSlotPicker` + integracja z przepływem rezerwacji, testy jednostkowe wymienione niżej.

**OUT (nie ruszać):** konfiguracja Keycloak i interceptorów (poza testami), stany NGXS (poza testami), wersje zależności, backend. Bez nowych bibliotek UI. Żadnych powiadomień e-mail (poza zakresem projektu).

## Wymagania techniczne

### A. Transloco scopes

1. Podzielić `src/assets/i18n/{pl,en}.json` według istniejących sekcji najwyższego poziomu:
   - **root** (ładowane zawsze): `nav`, `footer` i ewentualne klucze wspólne → zostają w `assets/i18n/{pl,en}.json`;
   - **scope `home`** → `assets/i18n/home/{pl,en}.json` (sekcja `home`);
   - **scope `browse`** → `assets/i18n/browse/{pl,en}.json` (sekcja `browse`);
   - **scope `booking`** → `assets/i18n/booking/{pl,en}.json` (sekcja `booking`);
   - **scope `clientDashboard`** → `assets/i18n/clientDashboard/{pl,en}.json`;
   - **scope `psychologistDashboard`** → `assets/i18n/psychologistDashboard/{pl,en}.json`.
   Wewnątrz pliku scope'a klucze BEZ prefiksu sekcji (np. `"title": "Potwierdź rezerwację"`), bo scope sam staje się prefiksem — istniejące użycia `'booking.title' | transloco` pozostają wtedy poprawne.
2. W plikach tras feature'ów (`home.routes.ts`, `psychologists.routes.ts`, `booking.routes.ts`, `dashboard-client.routes.ts`, `dashboard-psychologist.routes.ts`) dodać `providers: [provideTranslocoScope('...')]` z odpowiednim scope.
3. `confirm-booking.component.ts`: komunikaty snackbara pobierać z Transloco (`inject(TranslocoService)` → `translate('booking.success')` / `translate('booking.error')`) — zero literałów z tekstem UI w plikach `.ts` w całym `src/app`.
4. Przełączanie języka pl/en w navbarze działa po podziale (scope'y przeładowują się dla aktywnego języka).

### B. Komponent `AppointmentSlotPicker`

1. Lokalizacja: `src/app/features/booking/appointment-slot-picker/appointment-slot-picker.component.ts` (standalone, selektor `thera-appointment-slot-picker`, `OnPush`).
2. API komponentu (sygnałowe, zgodnie z konwencją ze STORY-01):
   - `psychologistId = input.required<string>()`;
   - `slotSelected = output<{ date: string; startHour: number }>()` (dopasować typ do modelu zwracanego przez `AvailabilityService` — sprawdzić interfejs w `core/services/availability.service.ts` i użyć jego pól).
3. Zachowanie: po zmianie `psychologistId` pobiera dostępności przez `AvailabilityService.getForPsychologist(...)` (np. `toObservable(psychologistId)` + `switchMap` + `toSignal`, albo `effect()`); stan `loading`/`error` jako sygnały; sloty pogrupowane po dniach; terminy z przeszłości nieaktywne; kliknięcie zaznacza slot i emituje `slotSelected`.
4. Widok: Angular Material (np. `mat-chip-listbox`/przyciski w siatce dni), wszystkie etykiety przez Transloco w scope `booking` (nowe klucze dodać w `booking/{pl,en}.json`, polski jako podstawowy).
5. Integracja z przepływem rezerwacji: w panelu szczegółów psychologa (`features/psychologists/browse/details-panel/`) osadzić picker; wybór slotu nawiguję do `booking/confirm` z parametrami pochodzącymi z wybranego slotu (query params `date`/`time` pozostają transportem, ale wartości pochodzą z dostępności, nie z ręcznego wpisu). `confirm-booking` wyświetla wybrany termin bez możliwości dowolnej edycji.

### C. Testy jednostkowe (Vitest, uruchamiane przez `pnpm test`)

Utworzyć pliki `*.spec.ts` obok testowanych jednostek:

| Jednostka | Scenariusze minimum |
|---|---|
| `core/interceptors/jwt.interceptor.ts` | token dostępny → nagłówek `Authorization: Bearer <token>`; brak tokenu → żądanie bez nagłówka; `updateToken` odrzucone → żądanie przechodzi bez tokenu (mock obiektu Keycloak) |
| `core/interceptors/error.interceptor.ts` | odpowiedź 401 i 403 → `router.navigate(['/'])`; inny błąd (np. 500) → propagacja bez nawigacji |
| `core/auth/guards/auth.guard.ts` | zalogowany z wymaganą rolą z `route.data` → wpuszcza; zalogowany bez roli → blokuje; niezalogowany → wywołuje `keycloak.login` |
| `core/auth/state/auth.state.ts` | dispatch `Login`/`Logout` → poprawny stan i selektory |
| `features/psychologists/state/psychologists.state.ts` | `LoadPsychologists` (mock serwisu) → `items`/`loading`; `SelectPsychologist` → `selectedId` |
| `dashboards/client/state/appointments.state.ts` | `LoadClientAppointments` / `LoadPsychologistAppointments` (mock serwisu) → `items`, obsługa błędu |
| `core/services/appointment.service.ts`, `psychologist.service.ts`, `availability.service.ts` | `HttpTestingController`: poprawny URL (`environment.apiGatewayUrl` + ścieżka), metoda HTTP i ciało dla każdej metody publicznej |
| `appointment-slot-picker.component.ts` | renderuje sloty z zamockowanego serwisu; klik emituje `slotSelected`; stan ładowania |

## Kryteria akceptacji

- [ ] `assets/i18n/` zawiera pliki root + 5 katalogów scope, a trasy feature'ów deklarują `provideTranslocoScope`.
- [ ] Brak hardkodowanych tekstów UI w plikach `.ts` (`grep` po polskich literałach w `src/app` nie zwraca komunikatów użytkownika).
- [ ] Przełączenie języka pl ⇄ en działa na każdej trasie (root + scope'y).
- [ ] Wybór terminu wizyty odbywa się przez `AppointmentSlotPicker` na podstawie dostępności psychologa; nie da się przejść do potwierdzenia z dowolną ręcznie wpisaną datą.
- [ ] Wszystkie testy z tabeli istnieją i przechodzą: `pnpm test` zielone.
- [ ] `pnpm build` kończy się sukcesem.

## Definition of Done

Build i testy zielone, ręczna weryfikacja: zmiana języka na każdej trasie, pełny przepływ rezerwacji przez picker (wybór psychologa → slot → potwierdzenie → snackbar z tłumaczenia). Bez commitów — zmiany zostają w working tree do przeglądu.
