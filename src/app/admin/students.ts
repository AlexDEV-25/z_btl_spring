import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

interface Student {
    id?: number;
    userId: number | null;
    studentCode: string;
    classId: number | null;

}

interface User {
    id: number;
    username: string;
    fullName: string;
    roleId?: number;
}

interface Class {
    id: number;
    name: string;
    year: string;
}

@Component({
    selector: 'admin-students',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './students.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class AdminStudentsComponent {
    baseUrl: string = 'http://localhost:8080/api/students';
    usersUrl: string = 'http://localhost:8080/api/user';
    classesUrl: string = 'http://localhost:8080/api/classes';
    students: Student[] = [];
    filteredStudents: Student[] = [];
    users: User[] = [];
    availableUsers: User[] = [];
    classes: Class[] = [];
    searchText: string = '';
    form: Student = { userId: null, studentCode: '', classId: null };
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
        this.loadStudents();
        this.loadUsers();
        this.loadClasses();
    }

    loadStudents() {
        this.http.get<Student[]>(this.baseUrl).subscribe({
            next: data => { this.students = data || []; this.applyFilter(); this.buildAvailableUsers(); },
            error: err => console.error('Load students failed', err)
        });
    }

    applyFilter() {
        const q = (this.searchText || '').trim().toLowerCase();
        if (!q) { this.filteredStudents = [...this.students]; return; }
        this.filteredStudents = this.students.filter(s => {
            const userName = this.getUserName(s.userId).toLowerCase();
            const className = this.getClassName(s.classId).toLowerCase();
            return (
                (s.studentCode || '').toLowerCase().includes(q) ||
                userName.includes(q) ||
                className.includes(q)

            );
        });
    }

    loadUsers() {
        this.http.get<User[]>(this.usersUrl).subscribe({
            next: data => { this.users = data || []; this.buildAvailableUsers(); },
            error: err => console.error('Load users failed', err)
        });
    }

    loadClasses() {
        this.http.get<Class[]>(this.classesUrl).subscribe({
            next: data => this.classes = data || [],
            error: err => console.error('Load classes failed', err)
        });
    }

    getUserName(userId: number | null): string {
        if (!userId) return 'N/A';
        const user = this.users.find(u => u.id === userId);
        return user ? `${user.username} (${user.fullName})` : 'Unknown';
    }

    getClassName(classId: number | null): string {
        if (!classId) return 'N/A';
        const cls = this.classes.find(c => c.id === classId);
        return cls ? `${cls.name} (${cls.year})` : 'Unknown';
    }

    reset() {
        this.form = { userId: null, studentCode: '', classId: null };
        this.editingId = null;
    }

    selectForEdit(s: Student) {
        this.editingId = s.id ?? null;
        this.form = {
            id: s.id,
            userId: s.userId ?? null,
            studentCode: s.studentCode,
            classId: s.classId ?? null

        };
        this.buildAvailableUsers();
    }

    // save() {
    //     const trimmedCode = (this.form.studentCode || '').trim().toUpperCase();
    //     const dob = (this.form.dateOfBirth || '').trim();
    //     const addr = (this.form.address || '').trim();
    //     const payload: Student = {
    //         userId: this.form.userId ? Number(this.form.userId) : null,
    //         studentCode: trimmedCode,
    //         classId: this.form.classId ? Number(this.form.classId) : null,
    //         dateOfBirth: dob ? dob : undefined,
    //         address: addr ? addr : undefined
    //     };
    //     if (!payload.userId || !payload.studentCode || !payload.classId) return;

    //     if (this.editingId) {
    //         const body: any = { id: this.editingId, ...payload };
    //         this.http.put(`${this.baseUrl}/${this.editingId}`, body, { responseType: 'text' }).subscribe({
    //             next: () => { this.loadStudents(); this.reset(); },
    //             error: err => console.error('Update failed', err)
    //         });
    //     } else {
    //         this.http.post(this.baseUrl, payload, { responseType: 'text' }).subscribe({
    //             next: () => { this.loadStudents(); this.reset(); },
    //             error: err => console.error('Create failed', err)
    //         });
    //     }
    // }

    save() {
        const trimmedCode = (this.form.studentCode || '').trim().toUpperCase();
        if (!/^[A-Z0-9]{6,10}$/.test(trimmedCode)) {
            alert("Mã sinh viên phải có 6-10 ký tự, chỉ gồm chữ hoa và số");
            return;
        }


        const payload: Student = {
            userId: this.form.userId ? Number(this.form.userId) : null,
            studentCode: trimmedCode,
            classId: this.form.classId ? Number(this.form.classId) : null
        };

        if (!payload.userId || !payload.studentCode || !payload.classId) {
            alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
            return;
        }

        if (this.editingId) {
            this.http.put<Student>(`${this.baseUrl}/${this.editingId}`, payload).subscribe({
                next: () => { this.loadStudents(); this.reset(); this.buildAvailableUsers(); },
                error: err => console.error('Update failed', err)
            });
        } else {
            this.http.post<Student>(this.baseUrl, payload).subscribe({
                next: () => { this.loadStudents(); this.reset(); this.buildAvailableUsers(); },
                error: err => console.error('Create failed', err)
            });
        }
    }

    private buildAvailableUsers() {
        // roleId: 3 => ROLE_SINH_VIÊN
        const takenIds = new Set((this.students || []).map(s => s.userId).filter((v): v is number => v != null));
        const currentUserId = this.form?.userId ?? null;
        this.availableUsers = (this.users || []).filter(u => {
            const isStudentRole = (u.roleId ?? 0) === 3;
            const isTaken = takenIds.has(u.id);
            const allowCurrent = currentUserId !== null && u.id === currentUserId;
            return isStudentRole && (!isTaken || allowCurrent);
        });
    }


    remove(id?: number) {
        if (!id) return;
        if (!confirm('⚠️ Bạn có chắc chắn muốn xóa sinh viên này?\n\nThao tác này không thể hoàn tác!')) return;
        this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' }).subscribe({
            next: () => { this.loadStudents(); this.buildAvailableUsers(); },
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
}


