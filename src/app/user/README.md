# Student Portal Frontend

## Tổng quan
Giao diện frontend cho hệ thống quản lý sinh viên, được phát triển bằng Angular với thiết kế hiện đại và responsive.

## Cấu trúc Files

### 📁 Core Files
- `user.ts` - Component chính với dashboard
- `user.service.ts` - Service để gọi API backend

### 📅 Schedule Module
- `schedule.html` - Template cho thời khóa biểu
- `schedule.css` - Styles cho thời khóa biểu
- `schedule.ts` - Logic cho thời khóa biểu

### 📊 Grades Module  
- `grades.html` - Template cho bảng điểm
- `grades.css` - Styles cho bảng điểm
- `grades.ts` - Logic cho bảng điểm

### 📝 Registration Module
- `registration.html` - Template cho đăng ký môn học
- `registration.css` - Styles cho đăng ký môn học
- `registration.ts` - Logic cho đăng ký môn học

## Tính năng chính

### 🎯 Dashboard
- Giao diện tổng quan với 3 card chính
- Navigation dễ dàng giữa các module
- Thiết kế responsive và hiện đại

### 📅 Thời khóa biểu
- **Hiển thị lịch học theo tuần**
  - Grid layout 7 ngày x 10 tiết
  - Màu sắc phân biệt các môn học
  - Thông tin chi tiết: giảng viên, phòng học, tín chỉ
  
- **Tính năng bổ sung**
  - Chọn học kỳ
  - Tooltip hiển thị thông tin đầy đủ
  - Tính toán thời gian tiết học tự động
  - Quick actions: xem điểm, đăng ký môn

### 📊 Bảng điểm
- **Hiển thị điểm chi tiết**
  - Điểm thành phần 1, 2 và cuối kỳ
  - Điểm chữ và trạng thái môn học
  - GPA tự động tính toán
  
- **Thống kê và phân tích**
  - Tổng quan GPA và phân loại
  - Tín chỉ tích lũy vs tổng tín chỉ
  - Thống kê theo điểm chữ
  
- **Tìm kiếm và lọc**
  - Tìm kiếm theo tên/mã môn
  - Lọc theo trạng thái và học kỳ
  - Xuất file CSV

### 📝 Đăng ký môn học
- **Quản lý đăng ký**
  - Xem môn đã đăng ký
  - Hủy đăng ký (với validation)
  - Đăng ký nhiều môn cùng lúc
  
- **Tìm kiếm môn học**
  - Tìm kiếm theo tên/mã môn/giảng viên
  - Lọc theo tín chỉ và trạng thái
  - Hiển thị lý do không thể đăng ký
  
- **Validation thông minh**
  - Kiểm tra giới hạn tín chỉ
  - Cảnh báo vượt quá giới hạn
  - Hiển thị thông tin slot còn lại

## Thiết kế UI/UX

### 🎨 Design System
- **Color Palette**: Gradient backgrounds với màu sắc hiện đại
- **Typography**: Segoe UI font family
- **Icons**: Emoji icons cho friendly UX
- **Shadows**: Subtle shadows cho depth

### 📱 Responsive Design
- **Desktop**: Grid layout tối ưu
- **Tablet**: Adaptive columns
- **Mobile**: Single column với touch-friendly buttons

### ⚡ Animations
- Hover effects với transform
- Smooth transitions
- Loading states
- Success/error messages

## API Integration

### 🔗 Service Methods
```typescript
// Schedule
getStudentSchedule(studentId, semester)

// Grades  
getStudentGrades(studentId)

// Registration
getAvailableCourses(studentId, semester)
registerCourse(studentId, request)
unregisterCourse(studentId, courseId)
getEnrolledCourses(studentId)
```

### 📡 Error Handling
- Try-catch blocks cho tất cả API calls
- User-friendly error messages
- Loading states during API calls
- Retry mechanisms

## State Management

### 💾 Local State
- Component-level state management
- Reactive forms với ngModel
- Set-based selection tracking
- Filter state persistence

### 🔄 Data Flow
1. Load data from API
2. Transform for UI display
3. Handle user interactions
4. Update backend via API
5. Refresh local state

## Performance Optimizations

### ⚡ Optimizations
- **Lazy Loading**: Components loaded on demand
- **Change Detection**: OnPush strategy where applicable
- **Filtering**: Client-side filtering for better UX
- **Caching**: Service-level caching for static data

### 📊 Bundle Size
- Standalone components
- Tree-shaking friendly imports
- Minimal external dependencies

## Usage Examples

### 🚀 Navigation
```typescript
// From dashboard
goToSchedule() {
    this.router.navigate(['/user/schedule']);
}

// Between modules
goToRegistration() {
    this.router.navigate(['/user/registration']);
}
```

### 🔍 Filtering
```typescript
filterCourses() {
    this.filteredCourses = this.availableCourses.filter(course => {
        return matchesSearch && matchesCredit && matchesAvailability;
    });
}
```

### 📝 Registration
```typescript
async registerSelectedCourses() {
    const registrationPromises = Array.from(this.selectedCourses)
        .map(courseId => this.userService.registerCourse(studentId, request));
    
    const results = await Promise.all(registrationPromises);
    // Handle results...
}
```

## Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Development Setup

### 📦 Dependencies
```json
{
    "@angular/core": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/router": "^17.0.0"
}
```

### 🛠️ Build Commands
```bash
# Development
ng serve

# Production build
ng build --prod

# Testing
ng test
```

## Future Enhancements

### 🔮 Planned Features
1. **Offline Support** - PWA capabilities
2. **Push Notifications** - Deadline reminders
3. **Dark Mode** - Theme switching
4. **Advanced Filters** - More granular filtering
5. **Calendar Integration** - Export to Google Calendar
6. **Mobile App** - React Native version

### 🎯 UX Improvements
1. **Skeleton Loading** - Better loading states
2. **Infinite Scroll** - For large course lists
3. **Drag & Drop** - Course selection
4. **Voice Search** - Accessibility feature
5. **Keyboard Shortcuts** - Power user features

## Accessibility

### ♿ Features
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode compatible
- Screen reader friendly

### 🎯 WCAG Compliance
- Level AA compliance target
- Color contrast ratios > 4.5:1
- Focus indicators
- Alternative text for icons

## Security Considerations

### 🔒 Client-side Security
- Input sanitization
- XSS prevention
- CSRF token handling
- Secure token storage
- Route guards for authentication

### 🛡️ Data Protection
- No sensitive data in localStorage
- Secure HTTP headers
- Content Security Policy
- Regular dependency updates

---

## Kết luận

Student Portal Frontend cung cấp trải nghiệm người dùng hiện đại và trực quan cho sinh viên quản lý học tập. Với thiết kế responsive, tích hợp API đầy đủ và performance tối ưu, hệ thống sẵn sàng phục vụ nhu cầu học tập của sinh viên.
