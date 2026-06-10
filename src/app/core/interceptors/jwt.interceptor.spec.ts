import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import Keycloak from 'keycloak-js';
import { jwtInterceptor } from './jwt.interceptor';

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve));

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let mockKeycloak: { updateToken: ReturnType<typeof vi.fn>; token?: string };

  beforeEach(() => {
    mockKeycloak = {
      updateToken: vi.fn().mockResolvedValue(true),
      token: 'test-token',
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: Keycloak, useValue: mockKeycloak },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('adds Authorization header when token is available', async () => {
    http.get('/api/test').subscribe();
    await flushPromises();

    const req = httpTesting.expectOne('/api/test');
    req.flush({});

    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('sends request without Authorization header when token is undefined', async () => {
    mockKeycloak.token = undefined;
    http.get('/api/test').subscribe();
    await flushPromises();

    const req = httpTesting.expectOne('/api/test');
    req.flush({});

    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('sends request without Authorization header when updateToken rejects', async () => {
    mockKeycloak.updateToken.mockRejectedValue(new Error('refresh failed'));
    mockKeycloak.token = undefined;
    http.get('/api/test').subscribe();
    await flushPromises();

    const req = httpTesting.expectOne('/api/test');
    req.flush({});

    expect(req.request.headers.has('Authorization')).toBe(false);
  });
});
