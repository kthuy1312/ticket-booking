# System Design - Melotix

Tài liệu này mô tả kiến trúc kỹ thuật của hệ thống đặt vé Melotix.

## 1. Kiến trúc tổng quan (High-Level Architecture)
Hệ thống được thiết kế theo mô hình **Monolithic** (để đơn giản hóa triển khai ban đầu) nhưng sẵn sàng tách thành **Microservices** nếu cần mở rộng.

- **Load Balancer:** Điều phối traffic (Nginx/AWS ELB).
- **App Server:** Node.js (Express) xử lý logic nghiệp vụ.
- **Cache Layer:** Redis lưu trữ session, cache danh sách concert và đặc biệt là **Distributed Lock** để xử lý tranh chấp vé.
- **Database:** MongoDB lưu trữ dữ liệu có cấu trúc linh hoạt (Concert, Booking, User).

## 2. Thiết kế Database (Data Model)

### Collection: `Concerts`
Lưu thông tin sự kiện.
- `_id`, `name`, `description`, `venue`, `eventDate`, `status` (DRAFT/ACTIVE/ENDED).

### Collection: `TicketTypes`
Lưu các hạng vé của từng concert.
- `concertId`, `name`, `price`, `totalQuantity`, `soldQuantity`, `reservedQuantity`.
- **Note:** `available = total - sold - reserved`.

### Collection: `Bookings`
Lưu thông tin đặt vé.
- `userId`, `concertId`, `ticketTypeId`, `quantity`, `totalAmount`, `status`.
- `expiredAt`: Thời gian hết hạn giữ chỗ (10 phút).

### Collection: `Vouchers`
Lưu thông tin khuyến mãi.
- `code`, `discountType`, `discountValue`, `maxUsage`, `currentUsage`.

## 3. Giải pháp cho Flash Sale (Concurrency Control)

### Thách thức: Overselling
Khi 500 người cùng nhấn "Đặt vé" trong 1 giây cho 10 vé còn lại.

### Giải pháp: Redis Distributed Lock
1. Khi khách hàng nhấn đặt vé, hệ thống sẽ tạo một `lock` trong Redis dựa trên `ticketTypeId`.
2. Chỉ 1 request được phép vào xử lý logic kiểm tra tồn kho và trừ số lượng tại một thời điểm.
3. Sử dụng `atomic update` của MongoDB (`$inc` với điều kiện `$gte`) như một lớp bảo vệ thứ hai.

### Luồng xử lý (Optimized Flow):
1. Client gửi yêu cầu.
2. Server check Redis cache xem vé còn không (Pre-check).
3. Server Acquire Lock (Redis).
4. Thực hiện Transaction:
   - Trừ `availableQuantity` trong DB.
   - Tạo bản ghi `Booking`.
5. Release Lock.
6. Trả kết quả về cho Client.

## 4. Quy trình xử lý đơn hàng (Booking Lifecycle)
1. **RESERVED:** Khách hàng đặt chỗ, vé bị khóa lại.
2. **WAITING_PAYMENT:** Chờ xác nhận thanh toán (Webhook từ cổng thanh toán).
3. **CONFIRMED:** Thanh toán thành công, gửi vé điện tử.
4. **EXPIRED/CANCELLED:** Nếu quá 10 phút không thanh toán, hệ thống tự động hoàn lại số lượng vé (Background Job).

## 5. Khả năng mở rộng (Scalability)
- **Database Indexing:** Đánh index cho `status`, `eventDate` và các field tìm kiếm.
- **Horizontal Scaling:** Chạy nhiều instance Node.js qua PM2 hoặc Docker Swarm.
- **Rate Limiting:** Sử dụng Middleware để giới hạn số request từ 1 IP để tránh Bot tấn công Flash Sale.
