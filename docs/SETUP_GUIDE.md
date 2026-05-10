# Local Setup Guide — Melotix

Tài liệu này hướng dẫn chi tiết cách cài đặt môi trường và chạy dự án Melotix trên máy tính cá nhân.

---

## 1. Yêu cầu hệ thống (Prerequisites)

Đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

- **Node.js**: Phiên bản 20 trở lên.
- **npm**: Đi kèm với Node.js.
- **Docker & Docker Compose**: Để chạy Redis và MongoDB nhanh chóng.
- **Git**: Để quản lý mã nguồn.

---

## 2. Thiết lập hạ tầng (Infrastructure)

Dự án sử dụng MongoDB làm database chính và Redis để xử lý Distributed Lock. Cách nhanh nhất là sử dụng Docker:

1. Mở terminal tại thư mục gốc của dự án.
2. Chạy lệnh:
   ```bash
   docker-compose up -d
   ```
3. Kiểm tra các container đang chạy: `docker ps`.

---

## 3. Cài đặt Backend

1. Di chuyển vào thư mục `be`:
   ```bash
   cd be
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Cấu hình môi trường:
   - Copy file `.env.example` thành `.env`.
   - Kiểm tra các thông số kết nối (mặc định đã cấu hình sẵn cho Docker).
4. **Nạp dữ liệu mẫu (Quan trọng):**
   ```bash
   npm run seed
   ```
   _Lệnh này sẽ tạo tài khoản Admin, các Concert mẫu và Voucher để bạn có thể test ngay._
5. Chạy Backend:
   ```bash
   npm run dev
   ```
   Backend sẽ chạy tại: `http://localhost:8080`.

---

## 4. Cài đặt Frontend

1. Mở một terminal mới và di chuyển vào thư mục `fe`:
   ```bash
   cd fe
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Chạy Frontend:
   ```bash
   npm run dev
   ```
   Truy cập ứng dụng tại: `http://localhost:5173`.

---

## 5. Thông tin tài khoản mặc định

Sau khi chạy lệnh `seed`, bạn có thể đăng nhập bằng các tài khoản sau:

| Vai trò           | Email          | Mật khẩu |
| ----------------- | -------------- | -------- |
| **Quản trị viên** | `ad@gmail.com` | `123456` |
| **Người dùng**    | `1@gmail.com`  | `123456` |
| **Người dùng**    | `2@gmail.com`  | `123456` |

---

## 6. Các lỗi thường gặp (Troubleshooting)

- **Lỗi kết nối MongoDB/Redis:** Kiểm tra xem Docker đã chạy chưa hoặc các cổng 27017/6379 có bị chiếm dụng bởi ứng dụng khác không.
- **Lỗi JWT Secret:** Đảm bảo file `.env` của Backend đã có khóa `JWT_SECRET`.
- **Lỗi Seed dữ liệu:** Nếu database đã có dữ liệu cũ, bạn có thể xóa các collection trong MongoDB và chạy lại `npm run seed`.
