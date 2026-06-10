import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import Keycloak from 'keycloak-js';
import { authGuard } from './auth.guard';

function makeRoute(roles: string[] = []): ActivatedRouteSnapshot {
  return { data: { roles } } as unknown as ActivatedRouteSnapshot;
}

const mockState = { url: '/protected' } as RouterStateSnapshot;

describe('authGuard', () => {
  let navigateSpy: ReturnType<typeof vi.fn>;
  let mockKeycloak: { authenticated: boolean; realmAccess?: { roles: string[] }; login: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    navigateSpy = vi.fn();
    mockKeycloak = {
      authenticated: true,
      realmAccess: { roles: [] },
      login: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: Keycloak, useValue: mockKeycloak },
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });
  });

  it('returns true when authenticated and no roles required', async () => {
    const result = await TestBed.runInInjectionContext(() =>
      authGuard(makeRoute(), mockState)
    );
    expect(result).toBe(true);
  });

  it('returns true when authenticated with required role present', async () => {
    mockKeycloak.realmAccess = { roles: ['client'] };
    const result = await TestBed.runInInjectionContext(() =>
      authGuard(makeRoute(['client']), mockState)
    );
    expect(result).toBe(true);
  });

  it('returns false when authenticated but required role is absent', async () => {
    mockKeycloak.realmAccess = { roles: ['client'] };
    const result = await TestBed.runInInjectionContext(() =>
      authGuard(makeRoute(['psychologist']), mockState)
    );
    expect(result).toBe(false);
  });

  it('calls keycloak.login when not authenticated', async () => {
    mockKeycloak.authenticated = false;
    await TestBed.runInInjectionContext(() =>
      authGuard(makeRoute(), mockState)
    );
    expect(mockKeycloak.login).toHaveBeenCalled();
  });
});
