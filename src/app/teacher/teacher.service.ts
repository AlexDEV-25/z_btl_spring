import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeacherScheduleInfo {
    teachingId: number;
    courseId: number;
    courseCode: string;
    courseName: string;
    credit: number;
    period: string;
    dayOfWeek: string;
    classroom: string;
    students: StudentInfo[];
}

export interface StudentInfo {
    studentId: number;
    studentCode: string;
    fullName: string;
    email: string;
    className: string;
    grade: string | null;
    componentScore1?: number | null;
    componentScore2?: number | null;
    finalExamScore?: number | null;
}

export interface EnrollmentDTO {
    id?: number;
    studentId: number;
    courseId: number;
    grade?: string | null;
    componentScore1?: number | null;
    componentScore2?: number | null;
    finalExamScore?: number | null;
}

export interface Enrollment {
    id: number;
    studentId: number;
    courseId: number;
    grade: string | null;
}

export interface SemesterInfo {
    id: number;
    semester: string;
    displayName: string;
}

export interface TeacherProfile {
    lecturerId: number;
    lecturerCode: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    specialization: string;
}

export interface ChangePasswordRequest {
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class TeacherService {
    private baseUrl = 'http://localhost:8080/api/teacher';

    constructor(private http: HttpClient) { }

    /**
     * Lấy danh sách tất cả semesters từ database
     */
    getAllSemesters(): Observable<SemesterInfo[]> {
        return this.http.get<SemesterInfo[]>(`${this.baseUrl}/semesters`);
    }

    /**
     * Lấy danh sách lớp học mà giảng viên được phân công dạy theo semester
     */
    getTeacherClasses(semester?: string): Observable<TeacherScheduleInfo[]> {
        const url = semester ? `${this.baseUrl}/classes?semester=${semester}` : `${this.baseUrl}/classes`;
        return this.http.get<TeacherScheduleInfo[]>(url);
    }

    /**
     * Lấy danh sách sinh viên trong một lớp học cụ thể
     */
    getStudentsForClass(teachingId: number): Observable<StudentInfo[]> {
        return this.http.get<StudentInfo[]>(`${this.baseUrl}/classes/${teachingId}/students`);
    }

    /**
     * Chấm điểm cho sinh viên
     */
    gradeStudent(enrollmentDTO: EnrollmentDTO): Observable<Enrollment> {
        return this.http.post<Enrollment>(`${this.baseUrl}/grade`, enrollmentDTO);
    }

    /**
     * Lấy thông tin cá nhân của giảng viên
     */
    getTeacherProfile(): Observable<TeacherProfile> {
        return this.http.get<TeacherProfile>(`${this.baseUrl}/profile`);
    }

    /**
     * Thay đổi mật khẩu
     */
    changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
        return this.http.post<ChangePasswordResponse>(`${this.baseUrl}/change-password`, request);
    }

    /**
     * Xuất bảng điểm lớp học ra file CSV
     */
    exportClassGrades(teachingId: number): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/classes/${teachingId}/export`, { responseType: 'blob' });
    }
}
