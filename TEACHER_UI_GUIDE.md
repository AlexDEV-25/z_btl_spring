# Hướng dẫn sử dụng Giao diện Giảng viên

## Tổng quan
Giao diện giảng viên được thiết kế để giảng viên có thể quản lý lớp học và chấm điểm sinh viên một cách hiệu quả.

## Cấu trúc thư mục
```
src/app/teacher/
├── teacher.ts          # Component chính với layout
├── teacher.html        # Template layout với sidebar
├── teacher.css         # Styles cho layout
├── classes.ts          # Component hiển thị lớp học
├── classes.html        # Template danh sách lớp học
├── classes.css         # Styles cho danh sách lớp học
├── grading.ts          # Component chấm điểm
├── grading.html        # Template chấm điểm
├── grading.css         # Styles cho chấm điểm
└── teacher.service.ts  # Service gọi API
```

## Các tính năng chính

### 1. Layout chính (teacher.ts)
- **Sidebar navigation** với 2 menu chính:
  - "My Classes" - Xem danh sách lớp học được phân công
  - "Grading" - Chấm điểm sinh viên
- **Responsive design** tương tự như admin panel
- **Router outlet** để hiển thị các component con

### 2. Danh sách lớp học (classes.ts)
**Tính năng:**
- Hiển thị tất cả lớp học mà giảng viên được phân công dạy
- Thông tin chi tiết cho mỗi lớp:
  - Mã môn học và tên môn học
  - Số tín chỉ
  - Học kỳ
  - Số lượng sinh viên
  - Số sinh viên đã được chấm điểm
- Preview danh sách sinh viên (hiển thị 3 sinh viên đầu tiên)
- Nút "Xem sinh viên" và "Chấm điểm"

**UI/UX:**
- Card layout với grid responsive
- Progress bar hiển thị tiến độ chấm điểm
- Hover effects và transitions mượt mà
- Loading states và error handling

### 3. Chấm điểm (grading.ts)
**Tính năng:**
- Chọn lớp học từ danh sách
- Hiển thị danh sách sinh viên trong lớp đã chọn
- Chấm điểm trực tiếp với dropdown
- Real-time save khi thay đổi điểm
- Progress tracking cho từng lớp

**UI/UX:**
- Two-panel layout: chọn lớp bên trái, chấm điểm bên phải
- Table layout cho danh sách sinh viên
- Visual feedback khi lưu điểm thành công/thất bại
- Responsive design cho mobile

### 4. Service (teacher.service.ts)
**API Methods:**
- `getTeacherClasses()` - Lấy danh sách lớp học
- `getStudentsForClass(teachingId)` - Lấy sinh viên trong lớp
- `gradeStudent(gradeRequest)` - Chấm điểm sinh viên

## Cách sử dụng

### 1. Truy cập giao diện
- Đăng nhập với tài khoản giảng viên
- Truy cập `/teacher` để vào giao diện chính

### 2. Xem lớp học
- Vào tab "My Classes"
- Xem danh sách tất cả lớp học được phân công
- Click "Xem sinh viên" để xem chi tiết sinh viên
- Click "Chấm điểm" để chuyển sang chế độ chấm điểm

### 3. Chấm điểm
- Vào tab "Grading"
- Chọn lớp học từ danh sách bên trái
- Chọn điểm cho từng sinh viên từ dropdown
- Điểm sẽ được lưu tự động khi thay đổi

## Styling và Theme

### Color Scheme
- **Primary**: #1976d2 (Blue)
- **Success**: #388e3c (Green)
- **Background**: #f4f6f8 (Light Gray)
- **Sidebar**: #2f4050 (Dark Blue)
- **Cards**: #fff (White)

### Typography
- **Headers**: 16px, font-weight: 600
- **Body**: 14px, font-weight: 400
- **Small text**: 12px, font-weight: 500

### Components
- **Cards**: Rounded corners (6-8px), subtle shadows
- **Buttons**: Rounded (4px), hover effects
- **Tables**: Clean borders, hover rows
- **Forms**: Clean inputs with focus states

## Responsive Design
- **Desktop**: Full sidebar + content layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Stack layout, full-width cards

## Error Handling
- Loading states cho tất cả API calls
- Error messages hiển thị rõ ràng
- Retry functionality cho failed requests
- Form validation với visual feedback

## Performance
- Lazy loading cho các component
- Efficient data binding
- Minimal DOM manipulation
- Optimized CSS với flexbox/grid

## Tương lai có thể mở rộng
- Export điểm ra Excel
- Thống kê điểm số
- Gửi thông báo cho sinh viên
- Upload file điểm hàng loạt
- Lịch sử thay đổi điểm
