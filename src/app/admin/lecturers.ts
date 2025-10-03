import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

interface Lecturer {
    id?: number;
    userId: number | null;
    lecturerCode: string;
}

interface User {
    id: number;
    username: string;
    fullName: string;
    roleId?: number;
}

@Component({
    selector: 'admin-lecturers',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './lecturers.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class AdminLecturersComponent {
    baseUrl: string = 'http://localhost:8080/api/lecturers';
    usersUrl: string = 'http://localhost:8080/api/user';
    lecturers: Lecturer[] = [];
    filteredLecturers: Lecturer[] = [];
    users: User[] = [];
    availableUsers: User[] = [];
    searchText: string = '';
    form: Lecturer = { userId: null, lecturerCode: '' };
    editingId: number | null = null;
    userName = 'Quản trị viên';

    // Menu items for admin sidebar
    menuItems: MenuItem[] = [
        { icon: '👥', label: 'Sinh viên', route: '/admin/students' },
        { icon: '📚', label: 'Học phần', route: '/admin/courses' },
        { icon: '🏢', label: 'Lớp học', route: '/admin/classes' },
        { icon: '👨‍🏫', label: 'Giảng viên', route: '/admin/lecturers' },
        { icon: '📅', label: 'Học kỳ', route: '/admin/semesters' },
        { icon: '🏆', label: 'Học bổng', route: '/admin/enrollments' },
        { icon: '👤', label: 'Người dùng', route: '/admin/users' },
        { icon: '🏛️', label: 'Khoa', route: '/admin/departments' },
        { icon: '📖', label: 'Phân công', route: '/admin/teachings' },
        { icon: '💰', label: 'Học phí', route: '/admin/payments' }
    ];

    constructor(private http: HttpClient, private router: Router) {
        this.loadLecturers();
        this.loadUsers();
    }

    loadLecturers() {
        this.http.get<Lecturer[]>(this.baseUrl).subscribe({
            next: data => { this.lecturers = data || []; this.applyFilter(); this.buildAvailableUsers(); },
            error: err => console.error('Load lecturers failed', err)
        });
    }

    applyFilter() {
        const q = (this.searchText || '').trim().toLowerCase();
        if (!q) { this.filteredLecturers = [...this.lecturers]; return; }
        this.filteredLecturers = this.lecturers.filter(l => {
            const userName = this.getUserName(l.userId).toLowerCase();
            return (
                userName.includes(q) ||
                (l.lecturerCode || '').toLowerCase().includes(q)
            );
        });
    }

    loadUsers() {
        this.http.get<User[]>(this.usersUrl).subscribe({
            next: data => { this.users = data || []; this.buildAvailableUsers(); },
            error: err => console.error('Load users failed', err)
        });
    }

    getUserName(userId: number | null): string {
        if (!userId) return 'N/A';
        const user = this.users.find(u => u.id === userId);
        return user ? `${user.username} (${user.fullName})` : 'Unknown';
    }

    reset() {
        this.form = { userId: null, lecturerCode: '' };
        this.editingId = null;
    }

    selectForEdit(l: Lecturer) {
        this.editingId = l.id ?? null;
        this.form = {
            id: l.id,
            userId: l.userId ?? null,
            lecturerCode: l.lecturerCode
        };
        this.buildAvailableUsers();
    }

    save() {
        const payload: Lecturer = {
            userId: this.form.userId ? Number(this.form.userId) : null,
            lecturerCode: (this.form.lecturerCode || '').trim()
        };
        if (!payload.userId || !payload.lecturerCode) return;

        if (this.editingId) {
            this.http.put(`${this.baseUrl}/${this.editingId}`, payload, { responseType: 'text' }).subscribe({
                next: () => { this.loadLecturers(); this.reset(); this.buildAvailableUsers(); },
                error: err => console.error('Update failed', err)
            });
        } else {
            this.http.post(this.baseUrl, payload, { responseType: 'text' }).subscribe({
                next: () => { this.loadLecturers(); this.reset(); this.buildAvailableUsers(); },
                error: err => console.error('Create failed', err)
            });
        }
    }

    remove(id?: number) {
        if (!id) return;
        if (!confirm('⚠️ Bạn có chắc chắn muốn xóa giảng viên này?\n\nThao tác này không thể hoàn tác!')) return;
        this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).subscribe({
            next: () => { this.loadLecturers(); this.buildAvailableUsers(); },
            error: err => console.error('Delete failed', err)
        });
    }

    logout() {
        if (confirm('🚪 Bạn có chắc chắn muốn đăng xuất?')) {
            // Clear any stored authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();

            // Redirect to login page
            this.router.navigate(['/login']);
        }
    }

    private buildAvailableUsers() {
        // roleId: 2 => ROLE_GIẢNG_VIÊN
        const takenIds = new Set((this.lecturers || []).map(l => l.userId).filter((v): v is number => v != null));
        const currentUserId = this.form?.userId ?? null;
        this.availableUsers = (this.users || []).filter(u => {
            const isLecturerRole = (u.roleId ?? 0) === 2;
            const isTaken = takenIds.has(u.id);
            const allowCurrent = currentUserId !== null && u.id === currentUserId;
            return isLecturerRole && (!isTaken || allowCurrent);
        });
    }
}


