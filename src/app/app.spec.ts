import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import Keycloak from 'keycloak-js';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { App } from './app';

const mockKeycloak = {
  authenticated: false,
  token: undefined,
  realmAccess: { roles: [] },
  login: vi.fn(),
  logout: vi.fn(),
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { en: { nav: { brand: 'TheraLink', tagline: '', signIn: '', signUp: '', profile: '', logout: '' } }, pl: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en', 'pl'] },
        }),
      ],
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should contain navbar and footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('thera-navbar')).not.toBeNull();
    expect(el.querySelector('thera-footer')).not.toBeNull();
  });
});
