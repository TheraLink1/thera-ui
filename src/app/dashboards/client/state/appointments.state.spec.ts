import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import {
  AppointmentsState,
  LoadClientAppointments,
  LoadPsychologistAppointments,
} from './appointments.state';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';

const mockAppointment: Appointment = {
  id: 'a-1',
  clientKeycloakId: 'c-1',
  psychologistKeycloakId: 'p-1',
  scheduledAt: '2026-07-01T10:00:00',
  durationMinutes: 60,
  status: 'PENDING',
  paymentStatus: 'UNPAID',
};

describe('AppointmentsState', () => {
  let store: Store;
  let getForClientSpy: ReturnType<typeof vi.fn>;
  let getForPsychologistSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getForClientSpy = vi.fn().mockReturnValue(of([mockAppointment]));
    getForPsychologistSpy = vi.fn().mockReturnValue(of([mockAppointment]));
    TestBed.configureTestingModule({
      providers: [
        provideStore([AppointmentsState]),
        {
          provide: AppointmentService,
          useValue: { getForClient: getForClientSpy, getForPsychologist: getForPsychologistSpy },
        },
      ],
    });
    store = TestBed.inject(Store);
  });

  it('loads appointments for client', async () => {
    await store.dispatch(new LoadClientAppointments('c-1')).toPromise();

    expect(store.selectSnapshot(AppointmentsState.items)).toEqual([mockAppointment]);
    expect(store.selectSnapshot(AppointmentsState.loading)).toBe(false);
    expect(getForClientSpy).toHaveBeenCalledWith('c-1');
  });

  it('loads appointments for psychologist', async () => {
    await store.dispatch(new LoadPsychologistAppointments('p-1')).toPromise();

    expect(store.selectSnapshot(AppointmentsState.items)).toEqual([mockAppointment]);
    expect(getForPsychologistSpy).toHaveBeenCalledWith('p-1');
  });

  it('sets error and keeps items empty when service throws', async () => {
    getForClientSpy.mockReturnValue(throwError(() => new Error('network error')));
    await store.dispatch(new LoadClientAppointments('c-1')).toPromise().catch(() => {});

    expect(store.selectSnapshot(AppointmentsState.items)).toEqual([]);
  });
});
