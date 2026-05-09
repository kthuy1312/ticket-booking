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

## 3. Lưu ý khi viết Test
1. **Cô lập dữ liệu**: Luôn sử dụng DB ảo hoặc mock API để không làm ảnh hưởng đến dữ liệu thật.
2. **Idempotency**: Đối với các chức năng đặt vé, hãy kiểm tra kỹ tính năng tránh đặt trùng (Idempotency Key).
3. **Edge Cases**: Đừng chỉ test trường hợp đúng (Happy Path), hãy test cả các trường hợp lỗi (sai mật khẩu, hết vé, voucher hết hạn...).
