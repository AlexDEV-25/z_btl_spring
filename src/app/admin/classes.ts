import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

interface ClassEntity {
    id?: number;
    name: string;
    year: string;
}

@Component({
    selector: 'admin-classes',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './classes.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class AdminClassesComponent {
    baseUrl: string = 'http://localhost:8080/api/classes';
    classes: ClassEntity[] = [];
    filteredClasses: ClassEntity[] = [];
    searchText: string = '';
    form: ClassEntity = { name: '', year: '' };
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
        this.loadClasses();
    }

    loadClasses() {
        this.http.get<ClassEntity[]>(this.baseUrl).subscribe({
            next: data => { this.classes = data || []; this.applyFilter(); },
            error: err => console.error('Load classes failed', err)
        });
    }

    applyFilter() {
        const q = (this.searchText || '').trim().toLowerCase();
        if (!q) { this.filteredClasses = [...this.classes]; return; }
        this.filteredClasses = this.classes.filter(c => (
            (c.name || '').toLowerCase().includes(q) ||
            String(c.year ?? '').toLowerCase().includes(q)
        ));
    }

    reset() {
        this.form = { name: '', year: '' };
        this.editingId = null;
    }

    selectForEdit(c: ClassEntity) {
        this.editingId = c.id ?? null;
        this.form = { id: c.id, name: c.name, year: c.year || '' } as ClassEntity;
    }

    save() {
        const payload: ClassEntity = {
            name: (this.form.name || '').trim(),
            year: (this.form.year || '').trim()
        };
        if (!payload.name || !payload.year) return;

        if (this.editingId) {
            this.http.put(`${this.baseUrl}/${this.editingId}`, payload, { responseType: 'text' }).subscribe({
                next: () => { this.loadClasses(); this.reset(); },
                error: err => console.error('Update failed', err)
            });
        } else {
            this.http.post(this.baseUrl, payload, { responseType: 'text' }).subscribe({
                next: () => { this.loadClasses(); this.reset(); },
                error: err => console.error('Create failed', err)
            });
        }
    }

    remove(id?: number) {
        if (!id) return;
        if (!confirm('⚠️ Bạn có chắc chắn muốn xóa lớp học này?\n\nThao tác này không thể hoàn tác!')) return;
        this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).subscribe({
            next: () => this.loadClasses(),
            error: err => console.error('Delete failed', err)
        });
    }

    logout() {
        if (confirm('🚪 Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            this.router.navigate(['/login']);
        }
    }
}


