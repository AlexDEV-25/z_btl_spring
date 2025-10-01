import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeacherService, TeacherScheduleInfo, StudentInfo, SemesterInfo } from './teacher.service';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';
@Component({
    selector: 'app-teacher-classes',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './classes.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class TeacherClassesComponent implements OnInit {
    classes: TeacherScheduleInfo[] = [];
    loading = false;
    userName = 'Giảng viên';
    selectedSemester = '2024-1';
    availableSemesters: SemesterInfo[] = [];

    // Sidebar menu items for teacher
    menuItems: MenuItem[] = [
        { icon: '📅', label: 'Lịch dạy', route: '/teacher/classes' },
        { icon: '📝', label: 'Chấm điểm', route: '/teacher/grading' },
        { icon: '👤', label: 'Thông tin cá nhân', route: '/teacher/profile' }
    ];

    // Timetable config
    periods: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    days: { label: string; value: string; index: number }[] = [
        { label: 'Mon', value: 'Monday', index: 1 },
        { label: 'Tue', value: 'Tuesday', index: 2 },
        { label: 'Wed', value: 'Wednesday', index: 3 },
        { label: 'Thu', value: 'Thursday', index: 4 },
        { label: 'Fri', value: 'Friday', index: 5 },
        { label: 'Sat', value: 'Saturday', index: 6 },
        { label: 'Sun', value: 'Sunday', index: 7 },
    ];
    error = '';

    events: Array<{
        dayIndex: number;
        start: number;
        end: number;
        title: string;
        subtitle?: string;
        room?: string;
        teacher?: string;
        color: string;
    }> = [];

    constructor(private teacherService: TeacherService, private router: Router) { }
    ngOnInit() {
        this.loadSemesters();
        this.loadClasses();
    }

    loadSemesters() {
        this.teacherService.getAllSemesters().subscribe({
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

    onSemesterChange() {
        console.log('Semester changed to:', this.selectedSemester);
        this.loadClasses();
    }

    private toEvents(data: TeacherScheduleInfo[]) {
        // Education management colors - matching the interface
        const palette = ['#ff6b35', '#3182ce', '#38a169', '#805ad5', '#319795', '#d53f8c', '#ecc94b'];
        let idx = 0;
        const parsePeriod = (p?: string): { start: number; end: number } => {
            if (!p) return { start: 1, end: 1 };
            const m = p.match(/(\d+)\s*-\s*(\d+)/);
            if (m) {
                const s = Math.max(1, Math.min(10, Number(m[1])));
                const e = Math.max(s, Math.min(10, Number(m[2])));
                return { start: s, end: e };
            }
            const n = Number(p);
            return { start: isNaN(n) ? 1 : n, end: isNaN(n) ? 1 : n };
        };

        const dayToIndex = (d?: string) => this.days.find(x => x.value === d)?.index ?? 1;

        return (data || []).map(c => {
            const { start, end } = parsePeriod(c.period as any);
            const color = palette[idx++ % palette.length];
            const className = (c.students && c.students.length > 0) ? (c.students[0] as any).className : '';
            return {
                dayIndex: dayToIndex(c.dayOfWeek as any),
                start,
                end: end + 1, // CSS grid end is exclusive
                title: `${c.courseCode} - ${c.courseName}`,
                subtitle: className,
                room: c.classroom || '',
                teacher: '',
                color
            };
        });
    }

    loadClasses() {
        this.loading = true;
        this.error = '';

        this.teacherService.getTeacherClasses(this.selectedSemester).subscribe({
            next: (data) => {
                console.log('Classes loaded successfully:', data);
                this.classes = data;
                this.events = this.toEvents(data);
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading classes:', error);
                this.error = `Lỗi khi tải danh sách lớp học: ${error.status} - ${error.statusText}`;
                this.loading = false;
            }
        });
    }

    getStudentCount(students: StudentInfo[]): number {
        return students.length;
    }

    getGradedCount(students: StudentInfo[]): number {
        return students.filter(s => s.grade !== null).length;
    }

    viewStudents(classInfo: TeacherScheduleInfo) {
        // Navigate to grading page with selected class
        // This could be implemented with router navigation
        console.log('View students for class:', classInfo);
    }

    gradeStudents(classInfo: TeacherScheduleInfo) {
        // Navigate to grading page with selected class
        // This could be implemented with router navigation
        console.log('Grade students for class:', classInfo);
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
