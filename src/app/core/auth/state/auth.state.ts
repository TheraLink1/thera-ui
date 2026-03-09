import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AuthService } from '../auth.service';

export class Login {
  static readonly type = '[Auth] Login';
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export interface AuthStateModel {
  isLoggedIn: boolean;
  userId: string;
  username: string;
  roles: string[];
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: { isLoggedIn: false, userId: '', username: '', roles: [] },
})
@Injectable()
export class AuthState {
  constructor(private authService: AuthService) {}

  @Selector()
  static isLoggedIn(state: AuthStateModel): boolean {
    return state.isLoggedIn;
  }

  @Selector()
  static userId(state: AuthStateModel): string {
    return state.userId;
  }

  @Selector()
  static roles(state: AuthStateModel): string[] {
    return state.roles;
  }

  @Action(Login)
  login(_ctx: StateContext<AuthStateModel>) {
    return this.authService.login();
  }

  @Action(Logout)
  logout(_ctx: StateContext<AuthStateModel>) {
    return this.authService.logout();
  }
}
