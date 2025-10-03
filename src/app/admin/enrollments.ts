import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

interface DepartmentInfo {
    id: number;
    name: string;
    code: string;
}

interface SemesterInfo {
    id: number;
    semester: string;
}

interface ScholarshipCandidate {
    studentId: number;
    studentCode: string;
    fullName: string;
    className: string;
    departmentName: string;
    gpa: number;
    totalCredits: number;
    completedCredits: number;
    semester: string;
}

@Component({
    selector: 'admin-enrollments',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './enrollments.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class AdminEnrollmentsComponent implements OnInit {
    baseUrl = 'http://localhost:8080/api/admin/enrollments';

    departments: DepartmentInfo[] = [];
    semesters: SemesterInfo[] = [];
    candidates: ScholarshipCandidate[] = [];
    selectedDepartmentId: number | null = null;
    selectedSemester: string = '';
    loading = false;
    exporting = false;
    error = '';
    searchPerformed = false;
    userName = 'Admin';

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
        { icon: '💰', label: 'Thanh toán', route: '/admin/payments' },
        { icon: '📖', label: 'Phân công', route: '/admin/teachings' }
    ];

    constructor(private http: HttpClient, private router: Router) { }

    ngOnInit() {
        this.loadDepartments();
        this.loadSemesters();
        this.loadScholarshipCandidates();
    }

    loadDepartments() {
        console.log('Loading departments from:', `${this.baseUrl}/departments`);
        this.http.get<DepartmentInfo[]>(`${this.baseUrl}/departments`).subscribe({
            next: (departments) => {
                this.departments = departments;
                console.log('Loaded departments:', departments);
                console.log('Departments array length:', departments.length);
                if (departments.length === 0) {
                    console.warn('No departments found in database');
                } else {
                    console.log('First department:', departments[0]);
                }
            },
            error: (error) => {
                console.error('Error loading departments:', error);
                console.error('Error details:', error.error);
                this.departments = [];
            }
        });
    }

    loadSemesters() {
        console.log('Loading semesters from:', `${this.baseUrl}/semesters`);
        this.http.get<SemesterInfo[]>(`${this.baseUrl}/semesters`).subscribe({
            next: (semesters) => {
                this.semesters = semesters;
                console.log('Loaded semesters:', semesters);
                console.log('Semesters array length:', semesters.length);
                if (semesters.length === 0) {
                    console.warn('No semesters found in database');
                } else {
                    console.log('First semester:', semesters[0]);
                }
            },
            error: (error) => {
                console.error('Error loading semesters:', error);
                console.error('Error details:', error.error);
                this.semesters = [];
            }
        });
    }

    onFilterChange() {
        this.loadScholarshipCandidates();
    }
    loadScholarshipCandidates() {
        this.loading = true;
        this.error = '';
        this.searchPerformed = true;

        // Build query parameters
        const params: any = {};
        if (this.selectedDepartmentId) {
            params.departmentId = this.selectedDepartmentId;
        }
        if (this.selectedSemester) {
            params.semester = this.selectedSemester;
        }

        console.log('Loading students eligible for scholarship (GPA >= 3.6) with params:', params);

        this.http.get<ScholarshipCandidate[]>(`${this.baseUrl}/scholarships/eligible-students`, { params }).subscribe({
            next: (candidates) => {
                this.candidates = candidates;
                this.loading = false;
                console.log('Loaded eligible scholarship candidates:', candidates);
                console.log(`Found ${candidates.length} students with GPA >= 3.6`);
            },
            error: (error) => {
                console.error('Error loading eligible scholarship candidates:', error);
                this.error = 'Không thể tải danh sách sinh viên đủ điều kiện học bổng';
                this.loading = false;
                this.candidates = [];
            }
        });
    }

    exportScholarshipList() {
        if (this.candidates.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        let params: any = {};
        if (this.selectedDepartmentId) params.departmentId = this.selectedDepartmentId;
        if (this.selectedSemester) params.semester = this.selectedSemester;

        this.http.get(`${this.baseUrl}/scholarships/export`, {
            params,
            responseType: 'blob'
        }).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;

                const departmentName = this.selectedDepartmentId
                    ? this.departments.find(d => d.id === this.selectedDepartmentId)?.name || 'all'
                    : 'all';
                const semesterName = this.selectedSemester || 'all';

                link.download = `hoc_bong_${departmentName}_${semesterName}_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
                this.exporting = false;
            },
            error: (error) => {
                console.error('Error exporting scholarship list:', error);
                alert('Có lỗi xảy ra khi xuất danh sách học bổng!');
                this.exporting = false;
            }
        });
    }

    getAverageGPA(): number {
        if (this.candidates.length === 0) return 0;
        const totalGPA = this.candidates.reduce((sum, candidate) => sum + candidate.gpa, 0);
        return totalGPA / this.candidates.length;
    }

    getTopGPA(): number {
        if (this.candidates.length === 0) return 0;
        return Math.max(...this.candidates.map(c => c.gpa));
    }

    getCompletionRate(candidate: ScholarshipCandidate): number {
        if (candidate.totalCredits === 0) return 0;
        return (candidate.completedCredits / candidate.totalCredits) * 100;
    }

    hasActiveFilters(): boolean {
        return !!this.selectedDepartmentId || !!this.selectedSemester;
    }

    getTableTitle(): string {
        if (this.selectedSemester) {
            return 'Danh sách sinh viên đủ điều kiện học bổng';
        } else {
            return 'Danh sách Sinh viên xuất sắc';
        }
    }

    resetFilters() {
        this.selectedDepartmentId = null;
        this.selectedSemester = '';
        this.loadScholarshipCandidates();
    }

    logout() {
        if (confirm('🚪 Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('user');
            sessionStorage.clear();
            this.router.navigate(['/login']);
        }
    }
}
