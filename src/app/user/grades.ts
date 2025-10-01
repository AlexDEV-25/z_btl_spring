import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, StudentGrades, GradeItem, SemesterInfo } from './user.service';
import { AuthService } from '../auth.service';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

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
    ) {}

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
                // Fallback to hardcoded semesters
                this.availableSemesters = [
                    { id: 1, semester: '2024-2', displayName: 'Học kỳ 2 (2024-2025)' },
                    { id: 2, semester: '2024-1', displayName: 'Học kỳ 1 (2024-2025)' },
                    { id: 3, semester: '2024-3', displayName: 'Học kỳ hè (2024-2025)' }
                ];
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
                // Show mock data for demo purposes
                this.loadMockGrades();
                this.loading = false;
            }
        });
    }

    private loadMockGrades() {
        console.log('Loading mock grades data...');
        const currentUser = this.authService.getCurrentUser();
        this.grades = {
            studentId: this.studentId,
            studentCode: currentUser?.username || 'SV001',
            studentName: currentUser?.fullName || 'Nguyễn Văn A',
            gpa: 3.25,
            totalCredits: 15,
            completedCredits: 9,
            gradeItems: [
                {
                    courseId: 1,
                    courseCode: 'CS101',
                    courseName: 'Lập trình cơ bản',
                    credit: 3,
                    componentScore1: 8.5,
                    componentScore2: 9.0,
                    finalExamScore: 8.0,
                    grade: 'B+',
                    semester: '2024-1',
                    status: 'Đã hoàn thành'
                },
                {
                    courseId: 2,
                    courseCode: 'MATH201',
                    courseName: 'Toán cao cấp',
                    credit: 4,
                    componentScore1: 7.5,
                    componentScore2: 8.0,
                    finalExamScore: 7.0,
                    grade: 'B',
                    semester: '2024-1',
                    status: 'Đã hoàn thành'
                },
                {
                    courseId: 3,
                    courseCode: 'ENG101',
                    courseName: 'Tiếng Anh 1',
                    credit: 2,
                    componentScore1: 9.0,
                    componentScore2: 8.5,
                    finalExamScore: 9.0,
                    grade: 'A',
                    semester: '2024-1',
                    status: 'Đã hoàn thành'
                },
                {
                    courseId: 4,
                    courseCode: 'PHY101',
                    courseName: 'Vật lý đại cương',
                    credit: 3,
                    componentScore1: 7.0,
                    componentScore2: 7.5,
                    finalExamScore: null,
                    grade: null,
                    semester: '2024-2',
                    status: 'Đang học'
                },
                {
                    courseId: 5,
                    courseCode: 'CHEM101',
                    courseName: 'Hóa học đại cương',
                    credit: 3,
                    componentScore1: null,
                    componentScore2: null,
                    finalExamScore: null,
                    grade: null,
                    semester: '2024-2',
                    status: 'Đang học'
                }
            ]
        };
        this.filteredGrades = [...this.grades.gradeItems];
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
        if (!this.grades) return 0;
        return this.grades.gradeItems.filter(item => item.status === 'Đã hoàn thành').length;
    }

    getInProgressCount(): number {
        if (!this.grades) return 0;
        return this.grades.gradeItems.filter(item => item.status === 'Đang học').length;
    }

    getGradeCount(grade: string): number {
        if (!this.grades) return 0;
        return this.grades.gradeItems.filter(item => item.grade === grade).length;
    }

    getGradeClass(grade: string | null | undefined): string {
        if (!grade) return '';
        
        const gradeMap: { [key: string]: string } = {
            'A': 'grade-a',
            'B+': 'grade-b-plus',
            'B': 'grade-b',
            'C': 'grade-c',
            'D': 'grade-d',
            'F': 'grade-f'
        };
        
        return gradeMap[grade] || '';
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

        // Create CSV content
        const headers = ['Mã môn', 'Tên môn học', 'Tín chỉ', 'Điểm TP1', 'Điểm TP2', 'Điểm CK', 'Điểm chữ', 'Trạng thái', 'Học kỳ'];
        const csvContent = [
            headers.join(','),
            ...this.grades.gradeItems.map(item => [
                item.courseCode,
                `"${item.courseName}"`,
                item.credit,
                item.componentScore1 ?? '',
                item.componentScore2 ?? '',
                item.finalExamScore ?? '',
                item.grade ?? '',
                `"${item.status}"`,
                item.semester ?? ''
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `bang_diem_${this.grades.studentCode}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
