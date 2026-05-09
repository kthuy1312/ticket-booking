# Giả định & Phạm vi Hệ thống (Assumptions & Scope)

Tài liệu này xác định các ranh giới thiết kế, các giả định nghiệp vụ và phạm vi triển khai thực tế của hệ thống Melotix.

---

## 1. Các Giả định Kỹ thuật & Nghiệp vụ (Assumptions)

### 1.1. Trạng thái Đơn hàng (Booking States)
Chúng tôi giả định một quy trình đặt vé an toàn gồm **6 trạng thái**. Hệ thống đã implement logic chuyển đổi trạng thái (State Machine) nghiêm ngặt để bảo vệ tồn kho:
- `RECEIVED`: Hệ thống đã nhận yêu cầu.
- `RESERVED`: Đã trừ vé trong kho và giữ chỗ (mặc định 15 phút).
- `WAITING_PAYMENT`: Người dùng đã chọn phương thức thanh toán.
- `CONFIRMED`: Giao dịch thành công, vé được xác nhận chính thức.
- `CANCELLED`: Người dùng chủ động hủy đơn.
- `EXPIRED`: Quá 15 phút giữ chỗ mà không thanh toán thành công.

### 1.2. Xác thực & Bảo mật
- Giả định mọi hành động liên quan đến đặt vé hoặc quản trị đều yêu cầu **JWT Auth**.
- Hệ thống giả định mỗi người dùng là một thực thể riêng biệt dựa trên `userId` để áp dụng Rate Limit và Giới hạn số vé.

### 1.3. Thanh toán & Thông báo
- **Thanh toán:** Không tích hợp cổng thanh toán thực (Stripe/VNPay). Hệ thống cung cấp API `confirm-payment` để giả lập (Mock) việc nhận callback thành công từ cổng thanh toán.
- **Thông báo:** Giả định việc gửi Email/SMS vé điện tử sẽ do một service khác xử lý qua Message Queue. Phiên bản hiện tại chỉ ghi Log để xác nhận luồng.

---

## 2. Phạm vi Thực hiện (Scope)

### 2.1. Những gì ĐÃ làm (Implemented)
- **Luồng Khách hàng:** Đăng ký/đăng nhập, tìm kiếm concert (filter theo tháng/địa điểm), đặt vé (Atomic Update + Redis Lock), áp dụng voucher, quản lý lịch sử đơn hàng.
- **Luồng Quản trị (Admin):** Dashboard thống kê, CRUD Concert, CRUD Ticket Types, Quản lý trạng thái Booking (Audit Log), Tạo và Vô hiệu hóa Voucher.
- **Bảo vệ Hệ thống:** Chống Overselling (không bao giờ bán quá số lượng), Chống Spam (Rate Limit 5 req/phút), Chống đầu cơ (Max 10 vé/concert/user).
- **Hạ tầng:** Idempotency Key (chống đặt trùng khi bấm nhanh), Background Job (tự động giải phóng vé khi hết hạn giữ chỗ).

### 2.2. Những gì CHƯA làm (Out of Scope)
- **Quản lý Voucher:** Hệ thống chỉ hỗ trợ **Tạo mới** và **Vô hiệu hóa (Toggle Active)**. Chúng tôi KHÔNG hỗ trợ cập nhật hoặc xóa voucher đã có để đảm bảo tính toàn vẹn của dữ liệu đối soát (Audit Trail).
- **Sơ đồ chỗ ngồi thực tế:** Hệ thống quản lý vé theo Hạng vé (Ticket Type) và Số lượng (Quantity), chưa hỗ trợ chọn chính xác tọa độ ghế (Seat Selection) trên bản đồ.
- **Real-time:** Chưa tích hợp WebSocket để cập nhật số lượng vé còn lại theo thời gian thực trên giao diện.

---

## 3. Quản lý Dữ liệu mẫu (Data Seeding)

Hệ thống được thiết kế để có thể chạy ngay lập tức thông qua cơ chế Seed dữ liệu:
- Không cần thao tác Admin để tạo dữ liệu ban đầu.
- Chỉ cần chạy `npm run seed`, hệ thống sẽ tự nạp 10 Concerts, 37 loại vé, và các Voucher mẫu để phục vụ việc kiểm thử luồng nghiệp vụ.
