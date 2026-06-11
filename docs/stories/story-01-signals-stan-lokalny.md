# STORY-01: Migracja stanu lokalnego komponentów na Angular Signals + modernizacja komponentów

> **Repo:** `thera-ui` (Angular 21, standalone components, NGXS 21, pnpm)
> **Status:** TODO
> **Zależności:** brak — wykonać PRZED STORY-02
> **Jak użyć:** uruchom Claude Code w katalogu `/Users/desirecutieqb/IdeaProjects/thera-ui` i poleć realizację tej story (`docs/stories/story-01-signals-stan-lokalny.md`).

---

## Kontekst projektu

TheraLink to platforma rezerwacji wizyt psychologicznych (UI po polsku, dostępny też angielski przez Transloco). `thera-ui` komunikuje się z backendem przez Spring Cloud Gateway (`environment.apiGatewayUrl`, lokalnie `http://localhost:8090`), autoryzacja przez Keycloak (`keycloak-angular`, interceptor `core/interceptors/jwt.interceptor.ts`). Stan globalny: NGXS (3 stany: `AuthState`, `PsychologistsState`, `AppointmentsState`).

**Problem:** komponenty są napisane w „starym" stylu Angulara — pola klasy + gettery zamiast sygnałów, wstrzykiwanie przez konstruktor, brak `OnPush`, subskrypcje `queryParams` w `ngOnInit`, a `BrowseComponent` omija istniejący `PsychologistsState` i woła `PsychologistService` bezpośrednio.

## Tło teoretyczne (dla wykonawcy i autora)

- **Signals** (`signal()`, `computed()`, `effect()`) to wbudowany w Angular system reaktywności drobnoziarnistej: sygnał przechowuje wartość, `computed()` wylicza wartości pochodne i przelicza się tylko, gdy zmienią się jego zależności, a framework wie dokładnie, który fragment widoku odświeżyć.
- **`ChangeDetectionStrategy.OnPush`** ogranicza detekcję zmian do sytuacji, gdy zmienią się referencje wejść, wyemitowane zostanie zdarzenie lub zmieni się czytany w szablonie sygnał — z sygnałami to naturalny, wydajny duet.
- **`inject()`** zastępuje wstrzykiwanie przez konstruktor — krótsza składnia, działa w funkcjach (guardy, interceptory) i jest rekomendowana przez aktualny Angular Style Guide.
- **`input()` / `output()`** to sygnałowe API komunikacji komponentów zastępujące dekoratory `@Input()` / `@Output()`; `input.required<T>()` wymusza przekazanie wartości na poziomie kompilatora.
- **Podział odpowiedzialności przyjęty w projekcie:** NGXS = stan współdzielony między widokami (zalogowany użytkownik, lista psychologów, wizyty); Signals = stan lokalny komponentu (filtry, zaznaczenie, flagi ładowania, pola formularzy).

## User story

Jako deweloper `thera-ui` chcę, aby wszystkie komponenty używały Angular Signals do stanu lokalnego oraz nowoczesnych API (inject, input/output, OnPush, selectSignal), żeby kod był spójny z konwencjami Angular 21 i wydajny przy detekcji zmian.

## Zakres

**IN:** wszystkie komponenty w `src/app/`:
- `features/home/home.component.ts`
- `features/psychologists/browse/browse.component.ts` + `psychologist-card/` + `details-panel/`
- `features/booking/confirm-booking/confirm-booking.component.ts`
- `dashboards/client/` — `client-dashboard`, `account-settings`, `appointment-history`, `billings`, `verify-form`
- `dashboards/psychologist/` — `psychologist-dashboard`, `account-settings`, `set-availability`, `appointments`, `billings`, `calendar`, `ratings`
- `shared/components/navbar/`, `shared/components/footer/`

**OUT (nie ruszać):** definicje stanów/akcji NGXS (mogą pozostać klasowe), interceptory, guard, serwisy HTTP, konfiguracja Keycloak/Transloco, wersje zależności, routing. Żadnych NgModules, żadnej migracji NGXS → SignalStore.

## Wymagania techniczne

1. **Stan lokalny → sygnały.** Każde mutowalne pole stanu komponentu zamienić na `signal()`. Przykłady z obecnego kodu:
   - `browse.component.ts`: `keyword`, `location`, `all`, `selected` → sygnały; getter `filtered` → `computed()`.
   - `confirm-booking.component.ts`: `date`, `time`, `psychologistId`, `psychologist`, `loading`, `description` → sygnały; getter `canConfirm` → `computed()`.
   - Analogicznie flagi `loading`/`error` i pola formularzy w pozostałych komponentach.
2. **Parametry trasy reaktywnie.** Zamiast `this.route.queryParams.subscribe(...)` w `ngOnInit` użyć `toSignal(this.route.queryParams, { initialValue: ... })` z `@angular/core/rxjs-interop`; wartości pochodne przez `computed()`, skutki uboczne (np. dispatch akcji ładowania) przez `effect()`.
3. **NGXS przez sygnały.** Odczyt stanu przez `store.selectSignal(Selektor)` (NGXS 21 wspiera signals; w razie braku — `toSignal(store.select(...))`). W szczególności:
   - `BrowseComponent` MA korzystać z `PsychologistsState`: dispatch `LoadPsychologists(keyword, location)` i odczyt `items`/`loading`/`selected` przez selektory — usunąć bezpośrednie wywołania `PsychologistService` z komponentu (serwis HTTP woła wyłącznie stan NGXS).
   - `Navbar` i dashboardy czytają `AuthState` (`isLoggedIn`, `roles`, `username`) przez `selectSignal`.
4. **`input()` / `output()`.** W `PsychologistCardComponent` i `DetailsPanelComponent` zamienić `@Input()`/`@Output()` na `input.required<...>()` / `input<...>()` / `output<...>()`. Zaktualizować szablony rodziców, jeśli zmieni się składnia.
5. **`inject()` zamiast konstruktora.** We wszystkich komponentach zależności jako `private readonly x = inject(X);` — konstruktory DI usunąć.
6. **`OnPush` wszędzie.** `changeDetection: ChangeDetectionStrategy.OnPush` w każdym komponencie z zakresu.
7. **Szablony.** Odczyt sygnałów przez wywołanie (`filtered()`, `loading()`). Dwukierunkowe wiązanie z `ngModel` zamienić na parę `[ngModel]="keyword()" (ngModelChange)="keyword.set($event)"` (lub `model()` tam, gdzie pole jest jednocześnie wejściem komponentu).
8. **Styl kodu.** Strict TypeScript, zero `any`, brak nieużywanych importów, nazwy i struktura plików bez zmian (chyba że wymaga tego pkt 4). Teksty UI bez zmian (i18n to STORY-02).
9. **Zachowanie bez regresji.** Filtrowanie listy psychologów, otwieranie panelu szczegółów (animacja `panelSlide`), rezerwacja z query params `date`/`time`, nawigacja i logowanie działają identycznie jak przed zmianą.

## Kryteria akceptacji

- [ ] Żaden komponent z zakresu nie ma `@Input()`, `@Output()`, wstrzykiwania przez konstruktor ani subskrypcji `queryParams` w `ngOnInit`.
- [ ] Wszystkie komponenty z zakresu mają `ChangeDetectionStrategy.OnPush`.
- [ ] `grep -r "signal(\|computed(" src/app --include="*.ts"` zwraca trafienia w komponentach z zakresu; gettery pochodne (`filtered`, `canConfirm`) nie istnieją jako gettery.
- [ ] `BrowseComponent` nie importuje `PsychologistService`; dane płyną przez `PsychologistsState` (`store.dispatch` + `store.selectSignal`).
- [ ] `pnpm build` kończy się sukcesem.
- [ ] `pnpm test` (Vitest) przechodzi (istniejący `app.spec.ts` + ewentualne poprawki testów wynikające ze zmian).

## Definition of Done

Build i testy zielone, ręczna weryfikacja przepływu: strona główna → wyszukiwanie → lista psychologów → panel szczegółów → potwierdzenie rezerwacji → dashboard (obu ról). Bez commitów — zmiany zostają w working tree do przeglądu.
