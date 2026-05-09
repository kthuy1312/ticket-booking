# Giả định & Phạm vi Hệ thống (Assumptions & Scope)

Tài liệu này làm rõ các giả định và giới hạn của phiên bản hiện tại.

## 1. Giả định (Assumptions)
- **Thanh toán:** Giả định việc thanh toán được thực hiện qua một cổng bên thứ 3 (như VNPay, Momo). Trong phạm vi bài làm này, bước thanh toán được giả lập bằng một API xác nhận thủ công hoặc tự động.
- **Thời gian giữ chỗ:** Mặc định là 10 phút. Sau thời gian này, nếu không thanh toán, vé sẽ tự động được giải phóng.
- **Tài khoản:** Người dùng phải đăng nhập để thực hiện đặt vé.
- **Thông báo:** Giả định hệ thống gửi email vé điện tử sau khi thanh toán thành công (Chưa implement thực tế gửi mail, chỉ log ra console).

## 2. Phạm vi thực hiện (Scope)
### Những gì ĐÃ làm:
- Toàn bộ luồng CRUD cho Concert, Ticket Types, Vouchers (Admin).
- Luồng đặt vé hoàn chỉnh cho khách hàng: Chọn vé -> Áp dụng Voucher -> Giữ chỗ -> Thanh toán.
- Cơ chế chống bán quá số lượng (Overselling) bằng Atomic Updates và Redis Locking logic.
- Giao diện Admin Dashboard quản lý và theo dõi số liệu thực tế.
- Chế độ Sáng/Tối (Light/Dark mode) tối ưu cho người dùng.
- Tìm kiếm và lọc nâng cao trên tất cả các trang quản trị.

### Những gì CHƯA làm (Out of Scope):
- **Tích hợp thanh toán thực tế:** Cần API Key từ nhà cung cấp dịch vụ thanh toán.
- **Gửi Email/SMS thực:** Cần SMTP server hoặc dịch vụ như SendGrid/Twilio.
- **Quản lý phân quyền chi tiết (RBAC):** Hiện tại chỉ có 2 role đơn giản là USER và ADMIN.
- **Sơ đồ ghế ngồi chi tiết (Seat Map):** Hiện tại chỉ quản lý theo số lượng (Quantity) của từng hạng vé, chưa chọn chính xác tọa độ ghế.

## 3. Xử lý lỗi & Gian lận
- Đơn hàng nghi ngờ gian lận (ví dụ: một user đặt quá nhiều vé trong thời gian ngắn) sẽ được gắn cờ để Admin xử lý thủ công trong Operation Dashboard.
- Hệ thống log lại mọi thay đổi trạng thái của Booking để đối soát (Audit Log).
