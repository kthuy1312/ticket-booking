# Concert Ticket Booking — Backend

Hệ thống API mạnh mẽ dành cho nền tảng Melotix, xử lý các luồng đặt vé concert, quản lý voucher và chống overselling.

---

## 🛠 Tech Stack

| Layer         | Công nghệ     | Chi tiết                           |
| ------------- | ------------- | ---------------------------------- |
| **Runtime**   | Node.js (ESM) | Phiên bản >= 20                    |
| **Framework** | Express 5     | Sử dụng Express 5.x mới nhất       |
| **Database**  | MongoDB       | Mongoose 9.x (Hỗ trợ Transactions) |
| **Caching**   | Redis         | ioredis (Locking & Caching)        |
| **Auth**      | JWT           | Bearer Token Authentication        |
| **Storage**   | Cloudinary    | Lưu trữ ảnh concert/banner         |
| **Docs**      | Swagger UI    | OpenAPI 3.0 (`/api-docs`)          |

---

## 🚀 Cài đặt & Chạy local

### 1. Yêu cầu hệ thống

- **Node.js** >= 20
- **MongoDB** (Local hoặc Atlas)
- **Redis** (Local hoặc Docker)

### 2. Cài đặt thư viện

```bash
cd be
npm install
```

### 3. Cấu hình biến môi trường

File `.env` cần có các thông tin sau:

```env
PORT=8080
MONGO_URI=mongodb+srv://... (hoặc mongodb://localhost:27017/melotix)
SECRET=YOUR_JWT_SECRET
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379 (Tùy chọn)

# Cloudinary (Dùng cho upload ảnh)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Khởi tạo dữ liệu (Seed)

```bash
npm run seed
```

**Tài khoản mặc định sau khi seed:**

- **Admin:** `ad@gmail.com` / `123456`
- **User:** `1@gmail.com` / `123456`

### 5. Khởi chạy

```bash
npm run dev     # Chế độ phát triển (nodemon)
npm start       # Chế độ production
```

---

## 🧪 Testing

Hệ thống sử dụng **Jest** và **Supertest** để chạy Integration Tests. Môi trường test hoàn toàn độc lập nhờ `mongodb-memory-server`.

```bash
npm test        # Chạy toàn bộ test suite
```

### 7. Kiểm tra

- **Health**: http://localhost:8080/health
- **Swagger UI**: http://localhost:8080/api-docs

---

## 📂 Cấu trúc mã nguồn

```text
src/
├── app.js           # Cấu hình Express app & Middleware
├── server.js        # Entry point khởi động server & DB
├── controller/      # Xử lý logic nghiệp vụ (Auth, Booking, Concert...)
├── routes/          # Định nghĩa các API endpoints
├── models/          # Mongoose Schemas & Models
├── libs/            # Thư viện dùng chung (db, redis config)
├── jobs/            # Background tasks (tự động hủy vé hết hạn)
├── config/          # Dữ liệu seed và cấu hình tĩnh
└── middlewares/     # Auth, Admin & Error handlers
```

---

## 🔐 Cơ chế lõi

### 1. Chống bán quá số lượng (Overselling)

Hệ thống sử dụng **Atomic Update** của MongoDB:

```javascript
TicketType.findOneAndUpdate(
  { _id: id, availableQuantity: { $gte: qty } },
  { $inc: { availableQuantity: -qty } },
);
```

Kết hợp với **Distributed Lock (Redis)** ở mức Controller để đảm bảo tính toàn vẹn dữ liệu khi có hàng ngàn request cùng lúc.

### 2. Idempotency Key

Mỗi request đặt vé bắt buộc gửi kèm một `idempotencyKey`. Nếu người dùng bấm đặt vé 2 lần do mạng lag, hệ thống sẽ trả về kết quả của lần đầu thay vì tạo thêm đơn mới.

---

## Test với Postman

- **Online Collection:** [Click để xem trên Postman Web](https://www.postman.com/restless-capsule-236537/workspace/lkt/collection/37851469-8083ccca-d3f8-46b0-9639-d4bb69b6e037?action=share&source=copy-link&creator=37851469)
- **Local Collection:** Sử dụng file tại thư mục: `docs/Event Ticket Booking.postman_collection.json`.

1. Import vào Postman.
2. Cấu hình environment variable `baseURL` thành `http://localhost:8080/api`.
3. Chạy các request theo thứ tự Auth -> Concert -> Booking.
