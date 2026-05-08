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
node src/seed.js
```
Tạo sẵn:
- **Admin**: `admin@concert.vn` / `Admin@123`
- **User 1**: `user1@example.com` / `User@123`
- **User 2**: `user2@example.com` / `User@123`
- 2 Concert, 5 loại vé, 3 voucher

### 5. Chạy server
```bash
npm run dev     # development (nodemon, hot-reload)
npm start       # production
```

### 6. Kiểm tra
- **Health**: http://localhost:8080/health
- **Swagger UI**: http://localhost:8080/api-docs

---

## Cấu trúc thư mục

```
be/
├── src/
│   ├── controller/
│   │   ├── authController.js
│   │   ├── concertController.js
│   │   ├── bookingController.js     ← core business logic
│   │   ├── voucherController.js
│   │   └── operationController.js  ← admin dashboard
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── concertRoute.js
│   │   ├── bookingRoute.js
│   │   ├── voucherRoute.js
│   │   └── operationRoute.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Concert.js
│   │   ├── TicketType.js
│   │   ├── Booking.js
│   │   ├── BookingLog.js
│   │   ├── Voucher.js
│   │   └── VoucherUsage.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    ← JWT verify
│   │   └── adminMiddleware.js   ← role check
│   ├── jobs/
│   │   └── expireBookings.js    ← auto-expire job (60s)
│   ├── libs/
│   │   └── db.js
│   ├── seed.js
│   ├── server.js
│   └── swagger.json
├── concert-booking.postman_collection.json
├── .env
└── package.json
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/auth/register` | — | Đăng ký |
| POST | `/api/auth/login` | — | Đăng nhập → JWT |
| GET | `/api/auth/me` | USER | Profile |

### Concerts (Public)
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/api/concerts` | — | Danh sách ACTIVE |
| GET | `/api/concerts/:id` | — | Chi tiết |
| GET | `/api/concerts/:id/ticket-types` | — | Loại vé + tồn kho |
| POST | `/api/concerts` | ADMIN | Tạo concert |
| PATCH | `/api/concerts/:id/status` | ADMIN | Cập nhật status |

### Bookings
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/bookings` | USER | Đặt vé (atomic) |
| GET | `/api/bookings/my` | USER | Lịch sử của tôi |
| GET | `/api/bookings/:id` | USER | Chi tiết |
| POST | `/api/bookings/:id/confirm-payment` | USER | Xác nhận thanh toán |
| POST | `/api/bookings/:id/cancel` | USER | Hủy booking |

### Vouchers
| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/api/vouchers/validate?code=&amount=` | USER | Kiểm tra voucher |
| POST | `/api/vouchers` | ADMIN | Tạo voucher |
| GET | `/api/vouchers` | ADMIN | Danh sách |
| PATCH | `/api/vouchers/:id/deactivate` | ADMIN | Vô hiệu hoá |

### Operation Dashboard (ADMIN)
| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/operation/stats` | Tổng quan hệ thống |
| GET | `/api/operation/bookings` | Tất cả booking |
| GET | `/api/operation/bookings/:id` | Chi tiết + audit log |
| PATCH | `/api/operation/bookings/:id/status` | Cập nhật thủ công |
| GET | `/api/operation/concerts` | Tất cả concert |
| POST | `/api/operation/concerts/:id/ticket-types` | Tạo loại vé |
| GET | `/api/operation/ticket-types/:id/availability` | Kiểm tra tồn vé |
| GET | `/api/operation/vouchers` | Voucher + usage stats |

---

## Booking Status State Machine

```
RECEIVED → RESERVED → WAITING_PAYMENT → CONFIRMED
                ↓               ↓
           CANCELLED / EXPIRED  CANCELLED
```

Khi CANCELLED hoặc EXPIRED: vé và voucher được **hoàn trả tự động**.

---

## Chống Overselling

Dùng MongoDB atomic `findOneAndUpdate` với điều kiện `$gte: quantity`:
```js
TicketType.findOneAndUpdate(
  { _id: ticketTypeId, availableQuantity: { $gte: quantity } },
  { $inc: { availableQuantity: -quantity } },
  { new: true, session }
)
```
Nếu `availableQuantity` không đủ → query trả `null` → 409 Conflict.

---

## Idempotency

Client gửi `idempotencyKey` (UUID) trong mỗi request tạo booking.  
Nếu key đã tồn tại → trả lại booking cũ, **không** tạo duplicate.

---

## Test với Postman

1. Import `concert-booking.postman_collection.json` vào Postman
2. Chạy **Login Admin** → token tự động lưu vào variable
3. Chạy **Login User1** → token tự động lưu
4. Chạy **List Active Concerts** → `concertId` tự động lưu
5. Chạy **Get Ticket Types** → `ticketTypeId` tự động lưu
6. Chạy **Create Booking** → `bookingId` tự động lưu
7. Chạy **Confirm Payment** hoặc **Cancel Booking**
