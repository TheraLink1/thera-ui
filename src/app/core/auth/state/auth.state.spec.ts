import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngxs/store';
import { AuthState, Login, Logout, AuthStateModel } from './auth.state';
import { AuthService } from '../auth.service';

describe('AuthState', () => {
  let store: Store;
  let loginSpy: ReturnType<typeof vi.fn>;
  let logoutSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loginSpy = vi.fn().mockResolvedValue(undefined);
    logoutSpy = vi.fn().mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideStore([AuthState]),
        {
          provide: AuthService,
          useValue: { login: loginSpy, logout: logoutSpy },
        },
      ],
    });
    store = TestBed.inject(Store);
  });

  it('has correct default state', () => {
    expect(store.selectSnapshot(AuthState.isLoggedIn)).toBe(false);
    expect(store.selectSnapshot(AuthState.userId)).toBe('');
    expect(store.selectSnapshot(AuthState.roles)).toEqual([]);
  });

  it('calls authService.login on Login dispatch', async () => {
    await store.dispatch(new Login()).toPromise();
    expect(loginSpy).toHaveBeenCalled();
  });

  it('calls authService.logout on Logout dispatch', async () => {
    await store.dispatch(new Logout()).toPromise();
    expect(logoutSpy).toHaveBeenCalled();
  });
});
