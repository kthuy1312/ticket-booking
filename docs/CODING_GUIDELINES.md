# Coding Guidelines & Conventions — Melotix

Tài liệu này quy định các tiêu chuẩn lập trình, cấu trúc dự án và các quy tắc chung dành cho lập trình viên tham gia phát triển hệ thống Melotix.

---

## 1. Cấu trúc Dự án (Project Structure)

Dự án được chia thành hai phần chính: `be/` (Backend) và `fe/` (Frontend).

```text
melotix/
├── be/                 # Backend Node.js/Express
│   ├── src/
│   │   ├── controller/ # Business logic (xử lý request/response)
│   │   ├── routes/     # Định nghĩa API endpoints + middleware
│   │   ├── models/     # Mongoose Schemas & Models
│   │   ├── middlewares/# Auth, Role checks, Rate limiters
│   │   ├── jobs/       # Background tasks (auto-expire...)
│   │   └── libs/       # Cấu hình DB, Redis, Utilities
│   └── tests/          # Integration tests (Jest)
├── fe/                 # Frontend React/Vite
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View layers (các trang chính)
│   │   ├── store/      # Quản lý trạng thái (Zustand)
│   │   └── lib/        # API services & Utilities
└── docs/               # Tài liệu hệ thống & Database
```

---

## 2. Quy tắc đặt tên (Naming Convention)

| Đối tượng | Quy tắc | Ví dụ |
|---|---|---|
| **File** | `camelCase` hoặc `kebab-case` | `bookingController.js`, `seat-map.tsx` |
| **Biến / Hàm** | `camelCase` | `createBooking`, `totalAmount` |
| **Model / Class** | `PascalCase` | `Booking`, `TicketType` |
| **Route Path** | `kebab-case` | `/ticket-types`, `/confirm-payment` |
| **Biến môi trường** | `UPPER_SNAKE_CASE` | `MONGO_URI`, `JWT_SECRET` |
| **Giá trị Enum** | `UPPER_SNAKE_CASE` | `"WAITING_PAYMENT"`, `"ACTIVE"` |

---

## 3. Phát triển API (Backend)

### 3.1. Quy trình thêm API mới
1. **Handler:** Tạo hàm xử lý trong `controller/`. Luôn dùng `try-catch` và `console.error` khi có lỗi.
2. **Route:** Đăng ký đường dẫn trong `routes/`. Kết hợp các middleware như `protectedRoute` hoặc `adminOnly`.
3. **Docs:** Cập nhật file `src/swagger.json` để đồng bộ tài liệu API.

### 3.2. Response Format
Chuẩn hóa dữ liệu trả về:
- **Thành công:** `200 OK` + `{ data }` hoặc `201 Created` + `{ message, data }`.
- **Lỗi:** Trả về mã lỗi phù hợp (400, 401, 403, 404, 429, 500) kèm `{ message: "Mô tả lỗi" }`.

### 3.3. Pagination (Phân trang)
Luôn hỗ trợ phân trang cho các API danh sách lớn:
```javascript
const { page = 1, limit = 20 } = req.query;
const skip = (parseInt(page) - 1) * parseInt(limit);
// Sử dụng Promise.all để lấy data và count đồng thời
```

---

## 4. Database & Concurrency (Quan trọng)

### 4.1. MongoDB Transactions
Sử dụng Transaction khi cần cập nhật nhiều Collection cùng lúc (ví dụ: tạo Booking + trừ vé + lưu Voucher).
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Các lệnh database kèm { session }
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
} finally {
  session.endSession();
}
```

### 4.2. Atomic Operations & Locking
- Luôn sử dụng `.findOneAndUpdate()` với điều kiện kiểm tra tồn kho (`$gte`) thay vì check trước update sau.
- Sử dụng **Redis Distributed Lock** cho các tài nguyên có tranh chấp cao (như Ticket Type) trong mùa Flash Sale.

---

## 5. Frontend Guidelines (React)

- **Components:** Chia nhỏ component theo tính năng, ưu tiên Functional Components.
- **State Management:** Dùng **Zustand** cho các trạng thái toàn cục (Auth, Cart), dùng Local State cho giao diện.
- **Styling:** Sử dụng Tailwind CSS kết hợp với CSS Variables để quản lý Theme.
- **Data Fetching:** Tập trung logic gọi API vào thư mục `lib/` hoặc `services/`.

---

## 6. Git Workflow & Commit

- **Nhánh chính:** `main` (mã nguồn ổn định).
- **Tính năng mới:** `feature/ten-tinh-nang`.
- **Sửa lỗi:** `fix/ten-loi`.
- **Commit Message:** Rõ ràng, súc tích:
  - `feat: thêm chức năng lọc concert`
  - `fix: sửa lỗi hiển thị voucher trên mobile`
  - `docs: cập nhật hướng dẫn cài đặt`
