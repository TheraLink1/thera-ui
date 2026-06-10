import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AppointmentService, Appointment } from './appointment.service';
import { environment } from '../../../environments/environment';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpTesting: HttpTestingController;
  const base = environment.apiGatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AppointmentService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('create() sends POST to /api/appointments', () => {
    const payload = { clientKeycloakId: 'c-1', psychologistKeycloakId: 'p-1' };
    service.create(payload).subscribe();

    const req = httpTesting.expectOne(`${base}/api/appointments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'a-1', ...payload });
  });

  it('getForClient() sends GET to /api/appointments/clientApts/:id', () => {
    service.getForClient('c-1').subscribe();

    const req = httpTesting.expectOne(`${base}/api/appointments/clientApts/c-1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getForPsychologist() sends GET to /api/appointments/psychologistApts/:id', () => {
    service.getForPsychologist('p-1').subscribe();

    const req = httpTesting.expectOne(`${base}/api/appointments/psychologistApts/p-1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('update() sends PUT to /api/appointments/:id', () => {
    const data = { status: 'APPROVED' as const };
    service.update('a-1', data).subscribe();

    const req = httpTesting.expectOne(`${base}/api/appointments/a-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: 'a-1', ...data });
  });
});
