# ✅ Đã sửa lỗi User ID - Student Portal

## 🔧 **Vấn đề đã khắc phục:**

### **Nguyên nhân lỗi:**
- Tất cả components đang **hardcode `studentId = 1`**
- Không lấy thông tin user thực tế từ JWT token
- API calls sử dụng sai user ID

### **Giải pháp đã triển khai:**

## 📋 **1. Tạo AuthService**
**File:** `d:\khen\my-app\src\app\auth.service.ts`

### **Tính năng:**
- ✅ **Decode JWT token** từ localStorage
- ✅ **Extract user info**: userId, username, role, fullName
- ✅ **getCurrentUserId()** - Lấy ID thực tế của user
- ✅ **getCurrentUser()** - Lấy toàn bộ thông tin user
- ✅ **Fallback to ID = 1** nếu không decode được (cho demo)

### **Interface UserInfo:**
```typescript
export interface UserInfo {
  userId: number;
  username: string;
  role: string;
  fullName?: string;
}
```

## 🔄 **2. Cập nhật tất cả User Components**

### **Schedule Component** (`schedule.ts`):
- ✅ Import `AuthService`
- ✅ `studentId: number` (không còn hardcode)
- ✅ `this.studentId = this.authService.getCurrentUserId()`
- ✅ Mock data sử dụng thông tin user thực tế

### **Grades Component** (`grades.ts`):
- ✅ Import `AuthService`
- ✅ `studentId: number` (không còn hardcode)
- ✅ `this.studentId = this.authService.getCurrentUserId()`
- ✅ Mock data sử dụng thông tin user thực tế

### **Registration Component** (`registration.ts`):
- ✅ Import `AuthService`
- ✅ `studentId: number` (không còn hardcode)
- ✅ `this.studentId = this.authService.getCurrentUserId()`
- ✅ Sửa import interfaces từ `user.service.ts`

### **Dashboard Component** (`dashboard.ts`):
- ✅ Import `AuthService`
- ✅ Hiển thị thông tin user: `currentUser.fullName || currentUser.username`
- ✅ Hiển thị User ID: `(ID: {{currentUser.userId}})`
- ✅ Logout sử dụng `authService.logout()`

## 🎯 **Kết quả:**

### **Trước khi sửa:**
```typescript
❌ studentId = 1; // Hardcode
❌ API calls: /api/students/1/grades
❌ Không biết user nào đang login
❌ Mock data generic
```

### **Sau khi sửa:**
```typescript
✅ studentId = authService.getCurrentUserId(); // Dynamic
✅ API calls: /api/students/{realUserId}/grades
✅ Hiển thị thông tin user thực tế
✅ Mock data với tên và mã sinh viên thực tế
```

## 📱 **User Experience:**

### **Dashboard:**
- ✅ **Header hiển thị:** "Xin chào, **Tên thật của user**"
- ✅ **User ID hiển thị:** "(ID: 123)" - ID thực tế từ JWT
- ✅ **Logout đúng cách:** Clear tất cả auth data

### **All Components:**
- ✅ **API calls đúng user ID**
- ✅ **Mock data personalized** với tên user thực tế
- ✅ **Error messages rõ ràng** với user ID thực tế

## 🔍 **Cách AuthService hoạt động:**

### **1. Decode JWT Token:**
```typescript
const token = localStorage.getItem('auth_token');
const payload = this.decodeJwtPayload(token);
```

### **2. Extract User Info:**
```typescript
const userInfo: UserInfo = {
    userId: payload.userId || payload.id || payload.sub || 1,
    username: payload.username || payload.user || payload.email || '',
    role: this.extractRole(payload),
    fullName: payload.fullName || payload.name || payload.displayName || ''
};
```

### **3. Fallback Strategy:**
- Nếu **JWT decode thành công** → Dùng thông tin thực tế
- Nếu **JWT decode thất bại** → Fallback to ID = 1 (cho demo)
- Nếu **không có token** → Fallback to ID = 1 (cho demo)

## 🚀 **Test ngay:**

### **1. Login với tài khoản sinh viên**
### **2. Kiểm tra Dashboard:**
- Thấy tên thật của user
- Thấy User ID thực tế

### **3. Kiểm tra Browser Console:**
```
Current user: {userId: 123, username: "student1", fullName: "Nguyễn Văn A", role: "SINH_VIEN"}
Loading mock schedule data...
Loading mock grades data...
```

### **4. Kiểm tra Network Tab:**
```
GET /api/students/123/grades (thay vì /api/students/1/grades)
GET /api/students/123/schedule (thay vì /api/students/1/schedule)
```

## 🎉 **Kết luận:**

✅ **Không còn hardcode studentId = 1**
✅ **Sử dụng User ID thực tế từ JWT token**
✅ **API calls đúng user**
✅ **Mock data personalized**
✅ **User experience tốt hơn**

Bây giờ Student Portal sẽ hoạt động với đúng thông tin của từng sinh viên đăng nhập! 🎓
