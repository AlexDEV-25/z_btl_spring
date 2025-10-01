import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, PaymentInfo, SemesterInfo } from './user.service';
import { Router } from '@angular/router';
import { LayoutComponent } from '../shared/layout.component';
import { MenuItem } from '../shared/sidebar.component';

@Component({
    selector: 'app-user-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, LayoutComponent],
    templateUrl: './payment.html',
    styleUrls: ['../shared/modern-theme.css']
})
export class UserPaymentComponent implements OnInit {
    paymentInfo: PaymentInfo | null = null;
    allPaymentInfo: PaymentInfo[] = [];
    availableSemesters: SemesterInfo[] = [];
    selectedSemester = '';
    loading = false;
    error = '';
    userName = 'Sinh viên';
    showAllSemesters = false;

    // Menu items for user sidebar
    menuItems: MenuItem[] = [
        { icon: '📅', label: 'Thời khóa biểu', route: '/user/schedule' },
        { icon: '📊', label: 'Bảng điểm', route: '/user/grades' },
        { icon: '📚', label: 'Đăng ký môn học', route: '/user/registration' },
        { icon: '💰', label: 'Học phí', route: '/user/payment' },
        { icon: '👤', label: 'Thông tin cá nhân', route: '/user/profile' }
    ];

    constructor(private userService: UserService, private router: Router) { }

    ngOnInit() {
        this.loadSemesters();
        this.loadPaymentInfo();
    }

    loadSemesters() {
        this.userService.getAllSemesters().subscribe({
            next: (semesters) => {
                this.availableSemesters = semesters;
                if (semesters.length > 0 && !this.selectedSemester) {
                    this.selectedSemester = semesters[0].semester;
                }
            },
            error: (error) => {
                console.error('Error loading semesters:', error);
            }
        });
    }

    loadPaymentInfo() {
        this.loading = true;
        this.error = '';

        this.userService.getPaymentInfo(this.selectedSemester).subscribe({
            next: (data) => {
                console.log('Payment info loaded successfully:', data);
                this.paymentInfo = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading payment info:', error);
                this.error = `Lỗi khi tải thông tin học phí: ${error.status} - ${error.statusText}`;
                this.loading = false;
            }
        });
    }

    loadAllPaymentInfo() {
        this.loading = true;
        this.error = '';

        this.userService.getAllPaymentInfo().subscribe({
            next: (data) => {
                console.log('All payment info loaded successfully:', data);
                this.allPaymentInfo = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading all payment info:', error);
                this.error = `Lỗi khi tải thông tin học phí: ${error.status} - ${error.statusText}`;
                this.loading = false;
            }
        });
    }

    onSemesterChange() {
        if (this.selectedSemester) {
            this.loadPaymentInfo();
        }
    }

    toggleView() {
        this.showAllSemesters = !this.showAllSemesters;
        if (this.showAllSemesters) {
            this.loadAllPaymentInfo();
        } else {
            this.loadPaymentInfo();
        }
    }

    createPayment(semester?: string) {
        if (confirm('🏦 Bạn có chắc chắn muốn tạo yêu cầu thanh toán cho học kỳ này?')) {
            this.userService.createPayment(semester).subscribe({
                next: (response) => {
                    console.log('Payment created:', response);
                    alert('✅ Tạo yêu cầu thanh toán thành công!');
                    if (this.showAllSemesters) {
                        this.loadAllPaymentInfo();
                    } else {
                        this.loadPaymentInfo();
                    }
                },
                error: (error) => {
                    console.error('Error creating payment:', error);
                    alert('❌ Lỗi khi tạo yêu cầu thanh toán: ' + error.message);
                }
            });
        }
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'PAID':
                return 'status-paid';
            case 'PENDING':
                return 'status-pending';
            case 'FAILED':
                return 'status-failed';
            default:
                return 'status-unknown';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'PAID':
                return '✅ Đã thanh toán';
            case 'PENDING':
                return '⏳ Chờ thanh toán';
            case 'FAILED':
                return '❌ Thanh toán thất bại';
            default:
                return '❓ Không xác định';
        }
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
