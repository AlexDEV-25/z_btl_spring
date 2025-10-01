import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, CourseRegistrationRequest, CourseRegistrationResponse, CourseInfo, SemesterInfo } from './user.service';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

@Component({
    selector: 'app-user-registration',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './registration.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class UserRegistrationComponent implements OnInit {
    availableCourses: CourseInfo[] = [];
    enrolledCourses: CourseInfo[] = [];
    loading = false;
    processing = false;
    error = '';
    successMessage = '';
    selectedSemester = '2024-1';
    userName = '';
    availableSemesters: SemesterInfo[] = [];

    // Menu items for sidebar
    menuItems: MenuItem[] = [
        { icon: '📅', label: 'Thời khóa biểu', route: '/user/schedule' },
        { icon: '📊', label: 'Bảng điểm', route: '/user/grades' },
        { icon: '📚', label: 'Đăng ký môn học', route: '/user/registration' },
        { icon: '💰', label: 'Học phí', route: '/user/payment' },
        { icon: '👤', label: 'Thông tin cá nhân', route: '/user/profile' }
    ];

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit() {
        this.userName = 'Sinh viên'; // Set default or get from auth service
        this.loadSemesters();
        this.loadAvailableCourses();
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

    loadAvailableCourses() {
        this.loading = true;
        this.error = '';

        this.userService.getAvailableCourses(this.selectedSemester).subscribe({
            next: (courses) => {
                console.log('Available courses loaded:', courses);
                this.availableCourses = courses;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading available courses:', error);
                this.error = 'Lỗi khi tải danh sách môn học';
                this.loadMockData(); // Fallback to mock data
                this.loading = false;
            }
        });
    }

    private loadMockData() {
        console.log('Loading mock course data...');
        // Mock available courses
        this.availableCourses = [
            { courseId: 1, courseCode: 'MATH101', courseName: 'Toán cao cấp', credit: 4, canRegister: true, availableSlots: 15, maxSlots: 50, lecturerName: 'TS. Nguyễn Văn A', period: '1-2', dayOfWeek: 'Thứ 2', classroom: 'A101' },
            { courseId: 2, courseCode: 'PHYS101', courseName: 'Vật lý đại cương', credit: 3, canRegister: true, availableSlots: 8, maxSlots: 40, lecturerName: 'PGS. Trần Thị B', period: '3-4', dayOfWeek: 'Thứ 3', classroom: 'B205' },
            { courseId: 3, courseCode: 'CHEM101', courseName: 'Hóa học đại cương', credit: 3, canRegister: false, reason: 'Hết slot', availableSlots: 0, maxSlots: 35, lecturerName: 'ThS. Lê Văn C', period: '5-6', dayOfWeek: 'Thứ 4', classroom: 'C301' },
            { courseId: 4, courseCode: 'ENG101', courseName: 'Tiếng Anh 1', credit: 2, canRegister: true, availableSlots: 25, maxSlots: 30, lecturerName: 'Ms. Sarah Johnson', period: '7-8', dayOfWeek: 'Thứ 5', classroom: 'D102' }
        ];

        // Mock enrolled courses
        this.enrolledCourses = [
            { courseId: 5, courseCode: 'CS101', courseName: 'Lập trình cơ bản', credit: 3, canRegister: false }
        ];
    }

    async registerCourse(courseId: number) {
        this.processing = true;
        this.error = '';
        this.successMessage = '';

        try {
            const request: CourseRegistrationRequest = {
                courseId: courseId,
                semester: this.selectedSemester
            };

            const response = await this.userService.registerCourse(request).toPromise();

            if (response?.success) {
                this.successMessage = response.message || 'Đăng ký môn học thành công!';
                // Reload the entire page after successful registration
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // Wait 1.5 seconds to show success message
            } else {
                this.error = response?.message || 'Lỗi khi đăng ký môn học';
            }
        } catch (error) {
            console.error('Error registering course:', error);
            this.error = 'Lỗi khi đăng ký môn học';
        } finally {
            this.processing = false;
        }
    }

    confirmUnregister(course: CourseInfo) {
        if (confirm(`🤔 Bạn có chắc chắn muốn hủy đăng ký môn "${course.courseName}" (${course.courseCode})?`)) {
            this.unregisterCourse(course.courseId);
        }
    }

    async unregisterCourse(courseId: number) {
        this.processing = true;
        this.error = '';
        this.successMessage = '';

        try {
            const response = await this.userService.unregisterCourse(courseId).toPromise();

            if (response?.success) {
                this.successMessage = response.message || 'Hủy đăng ký môn học thành công!';
                // Reload the entire page after successful unregistration
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // Wait 1.5 seconds to show success message
            } else {
                this.error = response?.message || 'Lỗi khi hủy đăng ký môn học';
            }
        } catch (error) {
            console.error('Error unregistering course:', error);
            this.error = 'Lỗi khi hủy đăng ký môn học';
        } finally {
            this.processing = false;
        }
    }

    getTotalEnrolledCredits(): number {
        return this.enrolledCourses.reduce((total, course) => total + course.credit, 0);
    }

    getAvailableCoursesCount(): number {
        return this.availableCourses.filter(c => c.canRegister).length;
    }

    isEnrolled(courseId: number): boolean {
        return this.enrolledCourses.some(c => c.courseId === courseId);
    }

    logout() {
        if (confirm('🚪 Bạn có chắc chắn muốn đăng xuất?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            this.router.navigate(['/login']);
        }
    }

    goToSchedule() {
        this.router.navigate(['/user/schedule']);
    }

    goToGrades() {
        this.router.navigate(['/user/grades']);
    }
}
