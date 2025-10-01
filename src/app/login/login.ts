import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styles: []
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    const loginData = { username: this.username, password: this.password };
    console.log('Sending login data:', loginData); // Debug
    this.http.post('http://localhost:8080/api/auth/login', loginData, { responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Login response (raw):', response);
          try {
            const raw = (response || '').toString().trim();
            let token = '';
            if (raw.startsWith('{')) {
              try {
                const obj = JSON.parse(raw);
                token = obj.token || obj.accessToken || obj.jwt || '';
                console.log('Parsed token from JSON:', token ? 'YES' : 'NO');
              } catch (e) {
                console.warn('Failed to parse JSON login response, trying regex');
                const m = raw.match(/\"(?:token|accessToken|jwt)\"\s*:\s*\"([^\"]+)\"/);
                if (m && m[1]) token = m[1];
              }
            } else if (raw.split('.').length === 3) {
              token = raw; // Looks like a JWT already
            } else {
              // Sometimes backend returns token without dots (custom format)
              token = raw;
            }
            if (!token) {
              alert('Đăng nhập thành công nhưng không nhận được token.');
              return;
            }
            localStorage.setItem('auth_token', token);

            const role = this.extractRoleFromJwt(token);
            console.log('Resolved role:', role);

            const roleUpper = (role || '').toString().toUpperCase();

            if (roleUpper.includes('ADMIN')) {
              this.router.navigateByUrl('/admin');
            } else if (roleUpper.includes('HIEU_TRUONG') || roleUpper.includes('HIỆU_TRƯỞNG')) {
              this.router.navigateByUrl('/admin');
            } else if (roleUpper.includes('GIANG_VIEN') || roleUpper.includes('GIẢNG_VIÊN')) {
              this.router.navigateByUrl('/teacher');
            }else if (roleUpper.includes('SINH_VIEN') || roleUpper.includes('SINH_VIÊN')) {
              this.router.navigateByUrl('/user');
            }  else {
              // Fallback route nếu role không khớp
              this.router.navigateByUrl('/user');
            }
          } catch (e) {
            console.error('Failed to process login token:', e);
            alert('Đăng nhập thành công nhưng xử lý token thất bại.');
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          alert('Đăng nhập thất bại: ' + (error.message || error.statusText));
        }
      });
  }

  private extractRoleFromJwt(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;

      const payloadJson = this.base64UrlDecode(parts[1]);
      const payload = JSON.parse(payloadJson);
      console.log('JWT payload:', payload);

      // Các key thường chứa role
      const candidates: any[] = [
        payload.role,
        payload.roles,
        payload.authorities,
        payload.auth,
        payload.scope
      ].filter(v => v);
      console.log('Role candidates:', candidates);

      if (candidates.length === 0) return null;

      const value = candidates[0];

      if (typeof value === 'string') {
        if (value.includes('ROLE_ADMIN') || value === 'ADMIN') return 'ROLE_ADMIN';
        if (value.includes('ROLE_USER') || value === 'USER') return 'ROLE_USER';
        if (value.includes('HIEU_TRUONG') || value.includes('HIỆU_TRƯỞNG')) return 'ROLE_HIỆU_TRƯỞNG';
        if (value.includes('GIANG_VIEN') || value.includes('GIẢNG_VIÊN')) return 'ROLE_GIẢNG_VIÊN';
        if (value.includes('SINH_VIEN') || value.includes('SINH_VIÊN')) return 'ROLE_SINH_VIEN';
        return value;
      }

      if (Array.isArray(value)) {
        const upper = value.map(x => String(x).toUpperCase());
        if (upper.includes('ROLE_ADMIN') || upper.includes('ADMIN')) return 'ROLE_ADMIN';
        if (upper.includes('ROLE_USER') || upper.includes('USER')) return 'ROLE_USER';
        if (upper.includes('HIEU_TRUONG') || upper.includes('HIỆU_TRƯỞNG')) return 'ROLE_HIỆU_TRƯỞNG';
        if (upper.includes('GIANG_VIEN') || upper.includes('GIẢNG_VIÊN')) return 'ROLE_GIẢNG_VIÊN';
        if (upper.includes('SINH_VIEN') || upper.includes('SINH_VIÊN')) return 'ROLE_SINH_VIEN';
        return upper[0] || null;
      }

      return null;
    } catch (err) {
      console.error('extractRoleFromJwt error:', err);
      return null;
    }
  }

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    return decodeURIComponent(escape(atob(padded)));
  }
}
