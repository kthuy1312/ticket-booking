# Tài liệu Thiết kế Hệ thống — Concert Ticket Booking

---

## 1. Giả định hệ thống

| # | Giả định |
|---|----------|
| 1 | Auth dùng **JWT Bearer Token** (header `Authorization: Bearer <token>`), thời hạn 7 ngày |
| 2 | Booking có **6 trạng thái**: `RECEIVED → RESERVED → WAITING_PAYMENT → CONFIRMED`, và nhánh kết thúc `CANCELLED / EXPIRED` |
| 3 | Sau khi tạo booking, hệ thống **giữ chỗ 15 phút** (`expiredAt = now + 15min`). Nếu không confirm payment → tự động EXPIRED |
| 4 | **Idempotency key** do client tạo (UUID v4) và gửi kèm mỗi request đặt vé — đảm bảo cùng request gửi nhiều lần chỉ xử lý một lần |
| 5 | Chống overselling bằng **MongoDB atomic `findOneAndUpdate`** với điều kiện `availableQuantity >= quantity` — không dùng Redis |
| 6 | Mỗi user chỉ dùng **1 voucher / 1 booking** và **mỗi voucher chỉ dùng 1 lần / user** (unique index trên VoucherUsage) |
| 7 | Có 2 role: `USER` (khách hàng) và `ADMIN` (operator/quản trị viên) |
| 8 | **Không tích hợp payment gateway thật** — `confirm-payment` API là mock (client gọi → status thành CONFIRMED) |
| 9 | Hệ thống chạy **single instance** (không cần distributed lock), đủ cho 300–500 req/phút với MongoDB |
| 10 | Auto-expire booking dùng **setInterval mỗi 60 giây** thay vì Redis TTL hay cron job ngoài |
| 11 | Implement: rate limiting (chặn abuse bot), Distributed Lock (Redis) |
| 12 | Voucher chỉ hỗ trợ **tạo mới và vô hiệu hoá** — không update, không xóa (để giữ audit trail) |

---

## 2. Đã làm

### Customer APIs
- ✅ Đăng ký / Đăng nhập (JWT)
- ✅ Xem danh sách concert ACTIVE
- ✅ Xem chi tiết concert
- ✅ Xem loại vé và số lượng còn lại
- ✅ Đặt vé (atomic reserve, idempotency, voucher apply)
- ✅ Xem lịch sử booking (có phân trang)
- ✅ Xem chi tiết booking
- ✅ Xác nhận thanh toán
- ✅ Hủy booking (hoàn vé + voucher)
- ✅ Kiểm tra / validate voucher

### Operation Dashboard APIs (Admin)
- ✅ Tổng quan thống kê (revenue, booking count by status)
- ✅ Xem tất cả booking (filter by status/concert/user, phân trang)
- ✅ Xem chi tiết booking + lịch sử thay đổi trạng thái (audit log)
- ✅ Cập nhật trạng thái booking thủ công (state machine validation)
- ✅ Xem tất cả concert (kể cả DRAFT)
- ✅ Tạo concert mới
- ✅ Cập nhật status concert
- ✅ Tạo loại vé cho concert
- ✅ Kiểm tra tồn kho vé
- ✅ Tạo voucher
- ✅ Xem danh sách voucher + thống kê usage rate
- ✅ Vô hiệu hoá voucher

### Hạ tầng
- ✅ MongoDB transaction cho toàn bộ flow đặt vé
- ✅ Background job auto-expire booking sau 15 phút
- ✅ Seed data (admin, 2 users, 2 concerts, 5 ticket types, 3 vouchers)
- ✅ Swagger UI tại `/api-docs`
- ✅ Postman collection (auto-extract token & IDs)
- ✅ README + CODING_GUIDE

| Layer | Công nghệ | Chi tiết |
|---|---|---|
| **Rate Limit** | express-rate-limit | Chặn Spam (5 req/phút/user) |
| **Concurrency** | Redis Lock | Chống Race Condition |
| **Test** | Load Test Script | Giả lập 100 users/500 req |

## 3. Chưa làm / Ngoài phạm vi

- ❌ Payment gateway thật (VNPay, Stripe, MoMo)
- ❌ Email confirmation sau khi booking
- ❌ WebSocket (real-time cập nhật tồn vé)
- ❌ Unit test / integration test tự động
- ❌ Docker / deployment config
- ❌ Refresh token (hiện tại chỉ access token 7 ngày)
- ❌ Xóa / sửa voucher

---

## 4. Thiết kế Database

### ERD (quan hệ giữa các collection)

```
User (1) ──────────────────── (N) Booking
User (1) ──────────────────── (N) VoucherUsage
User (1) ──────────────────── (N) BookingLog (changedBy)

Concert (1) ───────────────── (N) TicketType
Concert (1) ───────────────── (N) Booking

TicketType (1) ─────────────── (N) Booking

Booking (1) ───────────────── (N) BookingLog
Booking (1) ───────────────── (1) VoucherUsage

Voucher (1) ───────────────── (N) VoucherUsage
Voucher (1) ───────────────── (N) Booking
```

### Các collection và index quan trọng

| Collection | Index | Mục đích |
|---|---|---|
| User | `email` (unique) | Login |
| Concert | `status`, `eventDate`, `saleStartDate+saleEndDate` | Lọc concert |
| TicketType | `concertId`, `concertId+name` (unique) | Lấy vé theo concert |
| Booking | `idempotencyKey` (unique), `userId`, `concertId`, `status` | Chống duplicate, filter |
| BookingLog | `bookingId`, `createdAt` | Audit trail |
| Voucher | `code` (unique), `isActive`, `validFrom+validUntil` | Tìm & validate voucher |
| VoucherUsage | `voucherId+userId` (unique) | Chặn dùng 1 voucher 2 lần |

---

## 5. Luồng đặt vé chi tiết

```
POST /api/bookings
  │
  ├─ [1] Validate input (concertId, ticketTypeId, quantity, idempotencyKey)
  │
  ├─ [2] Idempotency check
  │       → Nếu key đã tồn tại → trả booking cũ (HTTP 200)
  │
  ├─ [3] Verify concert ACTIVE + trong thời gian mở bán
  │
  ├─ [4] Verify ticketType thuộc concert + quantity ≤ maxPerBooking
  │
  ├─ [5] ATOMIC: TicketType.findOneAndUpdate
  │       { availableQuantity: { $gte: quantity } }
  │       { $inc: { availableQuantity: -quantity } }
  │       → Fail → 409 "Vé không đủ"
  │
  ├─ [6] Tính giá: unitPrice × quantity
  │
  ├─ [7] Nếu có voucherCode:
  │       ├─ Validate voucher (active, trong hạn, minOrderAmount)
  │       ├─ ATOMIC: Voucher.findOneAndUpdate { currentUsage < maxUsage }
  │       │   → Fail → 400 "Hết lượt voucher"
  │       └─ Tính discountAmount
  │
  ├─ [8] Tạo Booking (status: RESERVED, expiredAt: +15min)
  │
  ├─ [9] Tạo VoucherUsage (nếu có voucher)
  │       → Nếu unique index violation → 400 "Đã dùng voucher này"
  │
  ├─ [10] Tạo BookingLog
  │
  └─ commitTransaction → HTTP 201
```

### Khi CANCEL hoặc EXPIRE:
1. Set booking status → CANCELLED/EXPIRED
2. `TicketType.$inc availableQuantity +quantity` (hoàn lại vé)
3. `Voucher.$inc currentUsage -1` (hoàn lại lượt voucher)
4. `VoucherUsage.deleteOne` (xóa record usage)
5. Tạo BookingLog

---

## 6. Booking State Machine

```
                    ┌─────────┐
                    │RECEIVED │
                    └────┬────┘
                         │ tạo booking
                    ┌────▼────┐
              ┌─────│RESERVED │─────┐
              │     └────┬────┘     │
              │          │ confirm  │ cancel/expire
              │     ┌────▼──────┐   │
              │     │WAITING    │   │
              │     │PAYMENT    │   │
              │     └────┬──────┘   │
              │          │ confirm  │ cancel
              │     ┌────▼────┐     │
              │     │CONFIRMED│     │
              │     └─────────┘     │
              │                     │
              │     ┌─────────┐     │
              └────▶│CANCELLED│◀────┘
                    └─────────┘
                    ┌─────────┐
                    │EXPIRED  │ (auto sau 15 phút)
                    └─────────┘
```

Admin có thể transition thủ công theo bảng:

| Từ | Có thể chuyển sang |
|---|---|
| RECEIVED | RESERVED, CANCELLED |
| RESERVED | WAITING_PAYMENT, CONFIRMED, CANCELLED, EXPIRED |
| WAITING_PAYMENT | CONFIRMED, CANCELLED, EXPIRED |
| CONFIRMED | CANCELLED |
| CANCELLED | (không) |
| EXPIRED | (không) |

---

## 7. Giải pháp chống các vấn đề Flash Sale

| Vấn đề | Giải pháp |
|---|---|
| **Overselling** | MongoDB atomic `findOneAndUpdate` + **Redis Distributed Lock** |
| **Double booking (retry)** | `idempotencyKey` unique index — request trùng trả về booking cũ |
| **Spam / Bot** | **Rate Limiter (5 req/phút/user)** |
| **Gom vé (Scalping)** | **Max Tickets Per User (Tối đa 10 vé/concert)** |
| **Voucher abuse** | `VoucherUsage(voucherId, userId)` unique index + atomic `currentUsage` check |
| **Hệ thống quá tải** | Đã test chịu tải 500 req/phút với 100 người dùng giả lập |
| **Booking bị treo** | Background job tự expire sau 15 phút, hoàn lại vé vào pool |
