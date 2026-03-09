import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/services/appointment.service';

export class LoadClientAppointments {
  static readonly type = '[Appointments] Load For Client';
  constructor(public clientId: string) {}
}

export class LoadPsychologistAppointments {
  static readonly type = '[Appointments] Load For Psychologist';
  constructor(public psychologistId: string) {}
}

export interface AppointmentsStateModel {
  items: Appointment[];
  loading: boolean;
  error: string | null;
}

@State<AppointmentsStateModel>({
  name: 'appointments',
  defaults: { items: [], loading: false, error: null },
})
@Injectable()
export class AppointmentsState {
  constructor(private service: AppointmentService) {}

  @Selector()
  static items(state: AppointmentsStateModel): Appointment[] {
    return state.items;
  }

  @Selector()
  static loading(state: AppointmentsStateModel): boolean {
    return state.loading;
  }

  @Action(LoadClientAppointments)
  loadForClient(ctx: StateContext<AppointmentsStateModel>, action: LoadClientAppointments) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getForClient(action.clientId).pipe(
      tap({
        next: (items) => ctx.patchState({ items, loading: false }),
        error: (err) => ctx.patchState({ loading: false, error: err.message }),
      })
    );
  }

  @Action(LoadPsychologistAppointments)
  loadForPsychologist(ctx: StateContext<AppointmentsStateModel>, action: LoadPsychologistAppointments) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getForPsychologist(action.psychologistId).pipe(
      tap({
        next: (items) => ctx.patchState({ items, loading: false }),
        error: (err) => ctx.patchState({ loading: false, error: err.message }),
      })
    );
  }
}
