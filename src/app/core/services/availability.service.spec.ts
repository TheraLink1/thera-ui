import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AvailabilityService, CalendarSlot } from './availability.service';
import { environment } from '../../../environments/environment';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let httpTesting: HttpTestingController;
  const base = environment.apiGatewayUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AvailabilityService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('getForPsychologist() sends GET to /api/availabilities/psychologist/:id', () => {
    service.getForPsychologist('p-1').subscribe();

    const req = httpTesting.expectOne(`${base}/api/availabilities/psychologist/p-1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() sends POST to /api/availabilities/:psychologistId', () => {
    const slot: Partial<CalendarSlot> = { psychologistId: 'p-1', date: '2026-07-01', startHour: '10:00' };
    service.create(slot).subscribe();

    const req = httpTesting.expectOne(`${base}/api/availabilities/p-1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(slot);
    req.flush({ ...slot, id: 'slot-1' });
  });
});
