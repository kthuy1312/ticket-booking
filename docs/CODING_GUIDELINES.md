# Coding Guidelines & Conventions

Hướng dẫn dành cho lập trình viên tham gia phát triển Melotix.

## 1. Cấu trúc thư mục (Project Structure)
```
be/
  src/
    controller/   # Xử lý logic nghiệp vụ
    models/       # Định nghĩa schema database
    routes/       # Định nghĩa các endpoint API
    middlewares/  # Các hàm trung gian (Auth, Validation)
    libs/         # Cấu hình kết nối (DB, Redis)
    jobs/         # Các tác vụ chạy ngầm
fe/
  src/
    pages/        # Các trang giao diện chính
    components/   # Các thành phần UI tái sử dụng
    services/     # Gọi API backend
    stores/       # Quản lý trạng thái (Zustand)
```

## 2. API Design
- **RESTful:** Sử dụng đúng các phương thức HTTP (GET, POST, PATCH, DELETE).
- **Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Thông báo nếu cần"
  }
  ```
- **Error Handling:** Luôn sử dụng `try-catch` và trả về mã lỗi phù hợp (400, 401, 403, 404, 500).

## 3. Quy tắc đặt tên (Naming Convention)
- **Biến/Hàm:** `camelCase` (ví dụ: `getAllBookings`).
- **Classes/Models:** `PascalCase` (ví dụ: `Concert`).
- **File:** `camelCase` hoặc `kebab-case`.
- **Database Fields:** `camelCase`.

## 4. Database & Performance
- **Atomic Operations:** Luôn sử dụng `.findOneAndUpdate()` hoặc `$inc` khi cập nhật số lượng vé để tránh Race Condition.
- **Indexing:** Đánh index cho các trường thường xuyên `find` hoặc `sort`.
- **Lean Queries:** Sử dụng `.lean()` cho các câu lệnh GET để tăng tốc độ phản hồi nếu không cần dùng instance của Mongoose.

## 5. Git Workflow
- Nhánh `main`: Code ổn định, sẵn sàng deploy.
- Nhánh `feature/xxx`: Phát triển tính năng mới.
- Commit message: Rõ ràng, súc tích (ví dụ: `feat: add redis locking for bookings`).
