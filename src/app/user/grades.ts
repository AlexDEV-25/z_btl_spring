import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, StudentGrades, GradeItem, SemesterInfo } from './user.service';
import { AuthService } from '../auth.service';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';
// Removed GradeCalculationService - logic moved to backend

@Component({
    selector: 'app-user-grades',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './grades.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class UserGradesComponent implements OnInit {
    grades: StudentGrades | null = null;
    filteredGrades: GradeItem[] = [];
    loading = false;
    error = '';
    studentId: number = 1;
    userName = '';
    selectedSemester = '2024-1';
    availableSemesters: SemesterInfo[] = [];

    // Menu items for sidebar
    menuItems: MenuItem[] = [
        { icon: '📅', label: 'Thời khóa biểu', route: '/user/schedule' },
        { icon: '📊', label: 'Bảng điểm', route: '/user/grades' },
        { icon: '📚', label: 'Đăng ký môn học', route: '/user/registration' },
        { icon: '💰', label: 'Học phí', route: '/user/payment' },
        { icon: '👤', label: 'Thông tin cá nhân', route: '/user/profile' }
    ];

    // Filter properties
    searchTerm = '';
    statusFilter = '';
    semesterFilter = '';

    constructor(
        private userService: UserService,
        private router: Router,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const currentUser = this.authService.getCurrentUser();
        this.studentId = 1;
        this.userName = currentUser?.fullName || 'Sinh viên';
        this.loadSemesters();
        this.loadGrades();
    }

    loadSemesters() {
        this.userService.getAllSemesters().subscribe({
            next: (semesters) => {
                console.log('Semesters loaded:', semesters);
                this.availableSemesters = semesters;
                // Set selected semester to the first one (newest) if not set
                if (semesters.length > 0 && !this.selectedSemester) {
                    this.selectedSemester = semesters[0].semester;
                }
            },
            error: (error) => {
                console.error('Error loading semesters:', error);
            }
        });
    }

    loadGrades() {
        this.loading = true;
        this.error = '';

        this.userService.getStudentGrades(this.selectedSemester).subscribe({
            next: (data) => {
                console.log('Grades loaded successfully:', data);
                this.grades = data;
                this.filteredGrades = [...data.gradeItems];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading grades:', error);
                this.error = `Lỗi khi tải bảng điểm: ${error.status} - ${error.message || error.statusText}`;
                this.loading = false;
            }
        });
    }


    filterGrades() {
        if (!this.grades) return;

        this.filteredGrades = this.grades.gradeItems.filter(item => {
            const matchesSearch = !this.searchTerm ||
                item.courseCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.courseName.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.statusFilter || item.status === this.statusFilter;

            const matchesSemester = !this.semesterFilter || item.semester === this.semesterFilter;

            return matchesSearch && matchesStatus && matchesSemester;
        });
    }

    getGPAClassification(gpa: number): string {
        if (gpa >= 3.6) return 'Xuất sắc';
        if (gpa >= 3.2) return 'Giỏi';
        if (gpa >= 2.5) return 'Khá';
        if (gpa >= 2.0) return 'Trung bình';
        return 'Yếu';
    }

    getCompletionPercentage(): number {
        if (!this.grades || this.grades.totalCredits === 0) return 0;
        return (this.grades.completedCredits / this.grades.totalCredits) * 100;
    }

    onSemesterChange() {
        console.log('Semester changed to:', this.selectedSemester);
        this.loadGrades();
    }

    getCompletedCount(): number {
        return this.grades?.completedCourses || 0;
    }

    getInProgressCount(): number {
        return this.grades?.inProgressCourses || 0;
    }

    getGradeCount(grade: string): number {
        if (!this.grades) return 0;
        return this.grades.gradeItems.filter(item => item.grade === grade).length;
    }

    getGradeClass(grade: string | null | undefined): string {
        if (!grade) return '';

        const gradeMap: { [key: string]: string } = {
            'A+': 'grade-a-plus',
            'A': 'grade-a',
            'B+': 'grade-b-plus',
            'B': 'grade-b',
            'C+': 'grade-c-plus',
            'C': 'grade-c',
            'D+': 'grade-d-plus',
            'D': 'grade-d',
            'F': 'grade-f'
        };

        return gradeMap[grade] || '';
    }

    getClassification(totalScore?: number | null): string | null {
        if (totalScore == null) return null;

        if (totalScore >= 9.5) return "Xuất sắc";
        if (totalScore >= 8.5) return "Giỏi";
        if (totalScore >= 8.0) return "Khá giỏi";
        if (totalScore >= 7.0) return "Khá";
        if (totalScore >= 6.5) return "TB khá";
        if (totalScore >= 5.5) return "Trung bình";
        if (totalScore >= 5.0) return "TB yếu";
        if (totalScore >= 4.0) return "Yếu (vẫn qua môn)";
        return "Trượt";
    }

    getScoreRange(totalScore?: number | null): string | null {
        if (totalScore == null) return null;

        if (totalScore >= 9.5) return "9.5 – 10.0";
        if (totalScore >= 8.5) return "8.5 – 9.4";
        if (totalScore >= 8.0) return "8.0 – 8.4";
        if (totalScore >= 7.0) return "7.0 – 7.9";
        if (totalScore >= 6.5) return "6.5 – 6.9";
        if (totalScore >= 5.5) return "5.5 – 6.4";
        if (totalScore >= 5.0) return "5.0 – 5.4";
        if (totalScore >= 4.0) return "4.0 – 4.9";
        return "< 4.0";
    }

    getClassificationClass(totalScore?: number | null): string {
        if (totalScore == null) return '';

        if (totalScore >= 9.5) return 'classification-excellent';
        if (totalScore >= 8.5) return 'classification-good';
        if (totalScore >= 8.0) return 'classification-fairly-good';
        if (totalScore >= 7.0) return 'classification-fair';
        if (totalScore >= 6.5) return 'classification-average-fair';
        if (totalScore >= 5.5) return 'classification-average';
        if (totalScore >= 5.0) return 'classification-weak-average';
        if (totalScore >= 4.0) return 'classification-weak';
        return 'classification-fail';
    }

    getStatusClass(status: string): string {
        const statusMap: { [key: string]: string } = {
            'Đã hoàn thành': 'completed',
            'Đang học': 'in-progress',
            'Chưa học': 'not-started'
        };

        return statusMap[status] || '';
    }

    exportGrades() {
        if (!this.grades) return;

        // Call backend API to generate and download CSV
        this.userService.exportGrades(this.selectedSemester).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bang_diem_${this.grades?.studentCode}_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('Error exporting grades:', error);
                alert('Có lỗi xảy ra khi xuất bảng điểm!');
            }
        });
    }

    goToSchedule() {
        this.router.navigate(['/user/schedule']);
    }

    goToRegistration() {
        this.router.navigate(['/user/registration']);
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
