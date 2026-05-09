# Melotix - Concert Booking Platform

Nền tảng đặt vé concert trực tuyến hiện đại, được thiết kế để xử lý các chiến dịch Flash Sale với lưu lượng truy cập cao.

## 🚀 Tính năng chính

### Khách hàng (Customer-facing)

- **Khám phá:** Xem danh sách concert đang mở bán với bộ lọc thông minh (tháng, địa điểm).
- **Chi tiết:** Xem sơ đồ vé, mô tả và chọn loại vé (VIP, Standard...).
- **Đặt chỗ (Reservation):** Giữ chỗ vé trong 10 phút, áp dụng voucher giảm giá.
- **Thanh toán:** Quy trình giả lập thanh toán an toàn.
- **Vé của tôi:** Quản lý lịch sử đặt vé và xem mã QR check-in.

### Vận hành (Operation Dashboard)

- **Dashboard:** Thống kê doanh thu, số lượng vé đã bán và trạng thái đơn hàng.
- **Quản lý Concert:** Tạo mới, chỉnh sửa concert và quản lý các loại vé.
- **Quản lý Đặt vé:** Theo dõi danh sách đơn hàng, cập nhật trạng thái thủ công (Xử lý gian lận/lỗi).
- **Quản lý Voucher:** Tạo chiến dịch khuyến mãi với giới hạn số lượng và thời gian.

## 🛠 Công nghệ sử dụng

- **Backend:** Node.js, Express.
- **Database:** MongoDB (Mongoose) - Lưu trữ dữ liệu bền vững.
- **Caching & Locking:** Redis - Xử lý tranh chấp (concurrency) khi Flash Sale.
- **Frontend:** React, Vite, Tailwind CSS, Ant Design.
- **Documentation:** Swagger (OpenAPI 3.0).

## 📦 Hướng dẫn cài đặt

### Yêu cầu hệ thống

- Node.js >= 18
- Docker & Docker Compose (Khuyên dùng để chạy Redis/MongoDB nhanh chóng)

### Khởi tạo môi trường với Docker

Để chạy Redis và MongoDB nhanh chóng mà không cần cài đặt lên máy, hãy chạy lệnh sau ở thư mục gốc:

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:

- **Redis:** Port 6379 (Dùng cho Distributed Locking)
- **MongoDB:** Port 27017 (Dùng cho Database local)

### Cài đặt Backend

1. Di chuyển vào thư mục `be`: `cd be`
2. Cài đặt thư viện: `npm install`
3. Cấu hình file `.env` (Dựa trên `.env.example`):
   ```env
   PORT=8080
   MONGODB_URI=mongodb://localhost:27017/ticket-booking
   JWT_SECRET=your_jwt_secret
   REDIS_URL=redis://localhost:6379 (Tùy chọn)
   ```
4. Chạy seed dữ liệu mẫu: `npm run seed`
5. Khởi chạy: `npm run dev`

### Cài đặt Frontend

1. Di chuyển vào thư mục `fe`: `cd fe`
2. Cài đặt thư viện: `npm install`
3. Cấu hình file `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
4. Khởi chạy: `npm run dev`

## 📖 Tài liệu hướng dẫn

- **Thiết kế hệ thống:** [docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md)
- **Giả định & Phạm vi:** [docs/ASSUMPTIONS.md](./docs/ASSUMPTIONS.md)
- **Coding Guidelines:** [docs/CODING_GUIDELINES.md](./docs/CODING_GUIDELINES.md)
- **API Docs:** Truy cập `http://localhost:8080/api-docs` khi server đang chạy.

## 🧪 Testing

- **Unit Test:** `npm test` (Đang cập nhật)
- **API Test:** Sử dụng Postman Collection trong thư mục `docs/Melotix.postman_collection.json`.

---

© 2026 Melotix Team.
