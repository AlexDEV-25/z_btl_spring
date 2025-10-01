# Routing Test Guide

## Current Routing Configuration

### User Routes (Updated in app.routes.ts):
```
/user → redirects to /user/dashboard
/user/dashboard → UserDashboardComponent (shows 3 cards)
/user/schedule → UserScheduleComponent (timetable)
/user/grades → UserGradesComponent (grade report)
/user/registration → UserRegistrationComponent (course registration)
```

## Test Steps:

1. **Navigate to `/user`**
   - Should automatically redirect to `/user/dashboard`
   - Should show dashboard with 3 cards: 📅 Thời khóa biểu, 📊 Bảng điểm, 📝 Đăng ký môn học

2. **Click on cards or navigate manually:**
   - `/user/schedule` → Should show timetable interface
   - `/user/grades` → Should show grades interface  
   - `/user/registration` → Should show course registration interface

## If still showing blank screen:

### Possible Issues:
1. **Development server needs restart** - Run `ng serve` again
2. **Component compilation errors** - Check browser console for errors
3. **Missing imports** - All components should be properly imported in app.routes.ts

### Debug Steps:
1. Open browser Developer Tools (F12)
2. Check Console tab for any errors
3. Check Network tab to see if components are loading
4. Try navigating directly to `/user/dashboard` in URL bar

## Files Updated:
- ✅ `app.routes.ts` - Added user child routes
- ✅ `user.ts` - Updated to use router-outlet only
- ✅ `dashboard.ts` - Created new dashboard component
- ✅ `schedule.ts`, `grades.ts`, `registration.ts` - Created user components

## Expected Behavior:
When user logs in and navigates to `/user`, they should see a dashboard with 3 clickable cards that navigate to different sections of the student portal.
