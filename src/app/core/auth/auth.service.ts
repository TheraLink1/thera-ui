import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloak.getUserRoles().includes(role);
  }

  login(): Promise<void> {
    return this.keycloak.login();
  }

  logout(): Promise<void> {
    return this.keycloak.logout(window.location.origin);
  }

  getUsername(): string {
    const profile = this.keycloak.getKeycloakInstance().tokenParsed;
    return profile?.['preferred_username'] ?? '';
  }

  getUserId(): string {
    return this.keycloak.getKeycloakInstance().subject ?? '';
  }
}
