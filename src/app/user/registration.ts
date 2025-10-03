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
    completedCourses: CourseInfo[] = []; // Môn đã học xong
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
        this.loadEnrolledCourses().then(() => {
            this.loadCompletedCourses().then(() => {
                this.loadAvailableCourses();
            });
        });
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

    loadEnrolledCourses(): Promise<void> {
        return new Promise((resolve) => {
            // Lấy danh sách môn đã đăng ký từ bảng điểm (chỉ lấy môn đang học)
            this.userService.getStudentGrades(this.selectedSemester).subscribe({
                next: (grades) => {
                    console.log('Student grades loaded for enrolled courses:', grades);
                    // Lọc các môn đang học (không có điểm cuối kỳ)
                    this.enrolledCourses = grades.gradeItems
                        .filter(item => item.status === 'Đang học')
                        .map(item => ({
                            courseId: item.courseId,
                            courseCode: item.courseCode,
                            courseName: item.courseName,
                            credit: item.credit,
                            canRegister: false,
                            canUnregister: true, // Có thể hủy đăng ký
                            reason: 'Đang học',
                            semester: item.semester
                        }));
                    resolve();
                },
                error: (error) => {
                    console.error('Error loading enrolled courses:', error);
                    this.enrolledCourses = [];
                    resolve();
                }
            });
        });
    }

    loadCompletedCourses(): Promise<void> {
        return new Promise((resolve) => {
            // Lấy danh sách môn đã học từ tất cả các học kỳ
            this.userService.getStudentGrades().subscribe({
                next: (grades) => {
                    console.log('Student grades loaded:', grades);
                    // Lọc các môn đã hoàn thành (có điểm)
                    this.completedCourses = grades.gradeItems
                        .filter(item => item.status === 'Đã hoàn thành' || item.grade !== null)
                        .map(item => ({
                            courseId: item.courseId,
                            courseCode: item.courseCode,
                            courseName: item.courseName,
                            credit: item.credit,
                            canRegister: false,
                            reason: 'Đã hoàn thành'
                        }));
                    resolve();
                },
                error: (error) => {
                    console.error('Error loading completed courses:', error);
                    this.completedCourses = [];
                    resolve();
                }
            });
        });
    }

    loadAvailableCourses() {
        this.loading = true;
        this.error = '';

        this.userService.getAvailableCourses(this.selectedSemester).subscribe({
            next: (courses) => {
                console.log('Available courses loaded:', courses);
                // Lọc bỏ các môn đã hoàn thành và đang học
                this.availableCourses = courses.filter(course =>
                    !this.isCompleted(course.courseId) && !this.isEnrolled(course.courseId)
                );
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading available courses:', error);
                this.error = 'Lỗi khi tải danh sách môn học';
                this.loading = false;
            }
        });
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
                // Reload data after successful registration
                setTimeout(() => {
                    this.loadEnrolledCourses().then(() => {
                        this.loadCompletedCourses().then(() => {
                            this.loadAvailableCourses();
                        });
                    });
                    this.successMessage = '';
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
                // Reload data after successful unregistration
                setTimeout(() => {
                    this.loadEnrolledCourses().then(() => {
                        this.loadCompletedCourses().then(() => {
                            this.loadAvailableCourses();
                        });
                    });
                    this.successMessage = '';
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

    isCompleted(courseId: number): boolean {
        return this.completedCourses.some(c => c.courseId === courseId);
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

    onSemesterChange() {
        console.log('Semester changed to:', this.selectedSemester);
        this.loadEnrolledCourses().then(() => {
            this.loadCompletedCourses().then(() => {
                this.loadAvailableCourses();
            });
        });
    }
}
