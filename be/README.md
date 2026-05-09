# Concert Ticket Booking — Backend

Backend Node.js/Express/MongoDB cho nền tảng đặt vé concert.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT Bearer Token |
| API Docs | Swagger UI (`/api-docs`) |

---

## Cài đặt & Chạy local

### 1. Prerequisites
- Node.js >= 18
- MongoDB Atlas URI (đã có trong `.env`)

### 2. Cài dependencies
```bash
cd be
npm install
```

### 3. Cấu hình `.env`
File `.env` đã có sẵn. Kiểm tra các biến:
```
PORT=8080
MONGO_URI=<mongodb atlas uri>
SECRET=JUST_A_SECRET
CLIENT_URL=http://localhost:5173
```

### 4. Seed dữ liệu demo
```bash
npm run seed
```
Tạo sẵn:
- **Admin**: `admin@concert.vn` / `Admin@123`
- **User 1**: `user1@example.com` / `User@123`
- **2 Concert**, 5 loại vé, 3 voucher

### 5. Chạy server
```bash
npm run dev     # development (nodemon, hot-reload)
npm start       # production
```

### 6. Testing
Hệ thống sử dụng Jest + Supertest kết hợp với MongoMemoryReplSet để chạy Integration Tests một cách an toàn (không ảnh hưởng dữ liệu thật).
```bash
npm test        # Chạy toàn bộ test suite
```

### 7. Kiểm tra
- **Health**: http://localhost:8080/health
- **Swagger UI**: http://localhost:8080/api-docs

---

## Cấu trúc thư mục
```
be/
├── src/
│   ├── app.js           ← cấu hình app (dùng cho testing)
│   ├── server.js        ← khởi động server
│   ├── controller/      ← logic xử lý request
│   ├── routes/          ← định nghĩa endpoints
│   ├── models/          ← mongoose schemas
│   ├── libs/            ← redis/db config
│   └── jobs/            ← background jobs (expire bookings)
└── tests/               ← bộ test integration
```

---

## Cơ chế quan trọng

### Chống Overselling & Race Condition
Sử dụng kết hợp 2 lớp bảo vệ:
1. **Distributed Lock (Redis):** Chặn các request đồng thời vào cùng một loại vé ngay từ lớp controller.
2. **Atomic Update (MongoDB):** Dùng toán tử `$inc` kết hợp điều kiện `$gte` để đảm bảo số lượng vé không bao giờ âm ngay cả khi có hàng ngàn request lọt qua lock.

### Idempotency
Hỗ trợ `idempotencyKey` trong request tạo booking để tránh việc user nhấn đặt vé nhiều lần do mạng lag dẫn đến việc bị trừ tiền hoặc giữ chỗ nhiều lần.

---

## Test với Postman
- **Online Collection:** [Click để xem trên Postman Web](https://www.postman.com/restless-capsule-236537/workspace/lkt/collection/37851469-8083ccca-d3f8-46b0-9639-d4bb69b6e037?action=share&source=copy-link&creator=37851469)
- **Local Collection:** Sử dụng file tại thư mục: `docs/Event Ticket Booking.postman_collection.json`.
1. Import vào Postman.
2. Cấu hình environment variable `baseURL` thành `http://localhost:8080/api`.
3. Chạy các request theo thứ tự Auth -> Concert -> Booking.
