import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigateSpy = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('navigates to / on 401 response', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/test').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('navigates to / on 403 response', () => {
    http.get('/api/test').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/test').flush(null, { status: 403, statusText: 'Forbidden' });

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('does not navigate on 500 response and propagates error', () => {
    let caughtError: unknown;
    http.get('/api/test').subscribe({ error: (e) => (caughtError = e) });
    httpTesting.expectOne('/api/test').flush(null, { status: 500, statusText: 'Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
    expect((caughtError as any).status).toBe(500);
  });
});
