# Testing Guide - Melotix

Hệ thống Melotix sử dụng **Jest** cho Backend và **Vitest** cho Frontend để đảm bảo tính ổn định của mã nguồn.

## 1. Backend Testing (Node.js)

Backend sử dụng `Jest` kết hợp với `Supertest` để kiểm tra các API endpoint. Để đảm bảo tính độc lập, chúng tôi sử dụng `mongodb-memory-server` để chạy một instance database ảo trong bộ nhớ.

### Yêu cầu
- Đã cài đặt dependencies (`npm install`).

### Cách chạy test
Chạy tất cả các test:
```bash
cd be
npm test
```

Chạy test kèm theo báo cáo độ bao phủ (Coverage):
```bash
npm test -- --coverage
```

### Cấu trúc thư mục test
- `be/tests/setup.js`: Khởi tạo database ảo trước khi chạy test.
- `be/tests/*.test.js`: Các file chứa logic kiểm tra cho từng module (Auth, Concert, Booking...).

---

## 2. Frontend Testing (React)

Frontend sử dụng `Vitest` - một framework testing cực nhanh dành cho Vite.

### Cách chạy test
Chạy test trong mode watch:
```bash
cd fe
npm test
```

Chạy test một lần duy nhất:
```bash
npm run test:run
```

---

## 3. Giả lập tải (Load Test Simulation)

Đây là bài test quan trọng nhất để kiểm tra khả năng chịu tải của hệ thống trong kịch bản **Flash Sale**. Chúng tôi sử dụng một script tùy chỉnh để giả lập hàng trăm người dùng thực hiện đặt vé cùng một lúc.

### Mục tiêu bài test
- Giả lập **100 người dùng** khác nhau.
- Tổng cộng **500 yêu cầu đặt vé** được gửi đi trong **1 phút**.
- Kiểm tra tính công bằng (Rate Limiting) và chống bán quá số lượng (Overselling).

### Cách thực thi
1. Đảm bảo Backend đang chạy (`npm run dev`).
2. Chạy lệnh sau:
```bash
cd be
node scratch/load_test.js
```

### Cách đọc kết quả
Sau khi script chạy xong (khoảng 60 giây), hãy kiểm tra phần cuối cùng của output:
- **Thành công:** Số vé đã đặt thành công (thường là 125 vé do dính Rate Limit 5 vé/người).
- **Thất bại:** Số yêu cầu bị từ chối bởi hệ thống (đây là cơ chế bảo vệ an toàn).
- **Chênh lệch khớp:** Phải hiển thị **✅ KHỚP TUYỆT ĐỐI**. Điều này xác nhận rằng số vé bị trừ trong database hoàn toàn khớp với số đơn hàng thành công, không có sai lệch dữ liệu.

---

## 4. Reset dữ liệu sau khi test

Do các bài test (đặc biệt là Load Test) sẽ tạo ra nhiều dữ liệu rác trong database, bạn nên reset lại database về trạng thái sạch ban đầu bằng lệnh:

```bash
cd be
npm run seed
```
