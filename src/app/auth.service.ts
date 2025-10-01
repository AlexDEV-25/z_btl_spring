import { Injectable } from '@angular/core';

export interface UserInfo {
  userId: number;
  username: string;
  role: string;
  fullName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  /**
   * Get current user info from JWT token
   */
  getCurrentUser(): UserInfo | null {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found');
        return null;
      }

      const payload = this.decodeJwtPayload(token);
      if (!payload) {
        console.log('Failed to decode JWT payload');
        return null;
      }

      console.log('JWT payload:', payload);

      // Extract user info from JWT payload
      const userInfo: UserInfo = {
        userId: payload.userId || payload.id || payload.sub || 1, // Fallback to 1 if not found
        username: payload.username || payload.user || payload.email || '',
        role: this.extractRole(payload),
        fullName: payload.fullName || payload.name || payload.displayName || ''
      };

      console.log('Extracted user info:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number {
    const user = this.getCurrentUser();
    return user?.userId || 1; // Fallback to 1 for demo
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get current user role
   */
  getCurrentRole(): string {
    const user = this.getCurrentUser();
    return user?.role || '';
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    sessionStorage.clear();
  }

  /**
   * Decode JWT payload
   */
  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        console.log('Invalid JWT format');
        return null;
      }

      const payloadJson = this.base64UrlDecode(parts[1]);
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Extract role from JWT payload
   */
  private extractRole(payload: any): string {
    const candidates = [
      payload.role,
      payload.roles,
      payload.authorities,
      payload.auth,
      payload.scope
    ].filter(v => v);

    if (candidates.length === 0) return '';

    const value = candidates[0];

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value[0] || '';
    }

    return '';
  }

  /**
   * Base64 URL decode
   */
  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    return decodeURIComponent(escape(atob(padded)));
  }
}
