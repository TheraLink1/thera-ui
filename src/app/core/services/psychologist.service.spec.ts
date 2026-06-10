import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PsychologistService, Psychologist } from './psychologist.service';
import { environment } from '../../../environments/environment';

describe('PsychologistService', () => {
  let service: PsychologistService;
  let httpTesting: HttpTestingController;
  const base = environment.apiGatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PsychologistService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getAll() sends GET to /api/psychologists without params', () => {
    service.getAll().subscribe();

    const req = httpTesting.expectOne(`${base}/api/psychologists`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAll(keyword, location) includes query params', () => {
    service.getAll('anxiety', 'Warsaw').subscribe();

    const req = httpTesting.expectOne(
      `${base}/api/psychologists?keyword=anxiety&location=Warsaw`
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById() sends GET to /api/psychologists/:id', () => {
    service.getById('p-1').subscribe();

    const req = httpTesting.expectOne(`${base}/api/psychologists/p-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'p-1' });
  });

  it('update() sends PUT to /api/psychologists/:id', () => {
    const data = { name: 'Updated Name' };
    service.update('p-1', data).subscribe();

    const req = httpTesting.expectOne(`${base}/api/psychologists/p-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 'p-1', ...data });
  });
});
