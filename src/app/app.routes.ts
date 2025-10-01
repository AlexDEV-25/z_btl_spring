import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AdminComponent } from './admin/admin';
import { UserComponent } from './user/user';
import { TeacherComponent } from './teacher/teacher';
import { AdminStudentsComponent } from './admin/students';
import { AdminClassesComponent } from './admin/classes';
import { AdminCoursesComponent } from './admin/courses';
import { AdminEnrollmentsComponent } from './admin/enrollments';
import { AdminLecturersComponent } from './admin/lecturers';
import { AdminTeachingsComponent } from './admin/teachings';
import { AdminUsersComponent } from './admin/users';
import { AdminDepartmentsComponent } from './admin/departments';
import { AdminPaymentsComponent } from './admin/payments';
import { AdminSemestersComponent } from './admin/semesters';

import { TeacherClassesComponent } from './teacher/classes';
import { TeacherGradingComponent } from './teacher/grading';
import { TeacherProfileComponent } from './teacher/profile';

import { UserScheduleComponent } from './user/schedule';
import { UserGradesComponent } from './user/grades';
import { UserRegistrationComponent } from './user/registration';
import { UserProfileComponent } from './user/profile';
import { UserPaymentComponent } from './user/payment';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: 'admin', component: AdminComponent, children: [
            { path: 'students', component: AdminStudentsComponent },
            { path: 'classes', component: AdminClassesComponent },
            { path: 'courses', component: AdminCoursesComponent },
            { path: 'semesters', component: AdminSemestersComponent },
            { path: 'enrollments', component: AdminEnrollmentsComponent },
            { path: 'lecturers', component: AdminLecturersComponent },
            { path: 'teachings', component: AdminTeachingsComponent },
            { path: 'users', component: AdminUsersComponent },
            { path: 'departments', component: AdminDepartmentsComponent },
            { path: 'payments', component: AdminPaymentsComponent },
            { path: '', redirectTo: 'students', pathMatch: 'full' }
        ]
    },
    {
        path: 'user', component: UserComponent, children: [
            { path: 'schedule', component: UserScheduleComponent },
            { path: 'grades', component: UserGradesComponent },
            { path: 'registration', component: UserRegistrationComponent },
            { path: 'payment', component: UserPaymentComponent },
            { path: 'profile', component: UserProfileComponent },
            { path: '', redirectTo: 'schedule', pathMatch: 'full' }
        ]
    },
    {
        path: 'teacher', component: TeacherComponent, children: [
            { path: 'classes', component: TeacherClassesComponent },
            { path: 'grading', component: TeacherGradingComponent },
            { path: 'profile', component: TeacherProfileComponent },
            { path: '', redirectTo: 'classes', pathMatch: 'full' }
        ]
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
