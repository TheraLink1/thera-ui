import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { tap } from 'rxjs';
import { PsychologistService } from '../../../core/services/psychologist.service';
import { Psychologist } from '../../../core/services/psychologist.service';

export class LoadPsychologists {
  static readonly type = '[Psychologists] Load';
  constructor(public keyword?: string, public location?: string) {}
}

export class SelectPsychologist {
  static readonly type = '[Psychologists] Select';
  constructor(public id: string | null) {}
}

export interface PsychologistsStateModel {
  items: Psychologist[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
}

@State<PsychologistsStateModel>({
  name: 'psychologists',
  defaults: { items: [], loading: false, error: null, selectedId: null },
})
@Injectable()
export class PsychologistsState {
  constructor(private service: PsychologistService) {}

  @Selector()
  static items(state: PsychologistsStateModel): Psychologist[] {
    return state.items;
  }

  @Selector()
  static loading(state: PsychologistsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static selected(state: PsychologistsStateModel): Psychologist | null {
    return state.items.find((p) => p.id === state.selectedId) ?? null;
  }

  @Action(LoadPsychologists)
  load(ctx: StateContext<PsychologistsStateModel>, action: LoadPsychologists) {
    ctx.patchState({ loading: true, error: null });
    return this.service.getAll(action.keyword, action.location).pipe(
      tap({
        next: (items) => ctx.patchState({ items, loading: false }),
        error: (err) => ctx.patchState({ loading: false, error: err.message }),
      })
    );
  }

  @Action(SelectPsychologist)
  select(ctx: StateContext<PsychologistsStateModel>, action: SelectPsychologist) {
    ctx.patchState({ selectedId: action.id });
  }
}
