# Melotix - Frontend (React + Vite)

Giao diện người dùng hiện đại cho nền tảng đặt vé Melotix, được xây dựng với mục tiêu mang lại trải nghiệm mượt mà, trực quan và cao cấp.

## ✨ Điểm nổi bật
- **Luxury Aesthetic:** Sử dụng tông màu tối sang trọng, hiệu ứng glassmorphism và micro-interactions.
- **Responsive:** Tối ưu hóa trên mọi thiết bị (Mobile, Tablet, Desktop).
- **Dark/Light Mode:** Hỗ trợ chuyển đổi giao diện linh hoạt.
- **Real-time Updates:** Cập nhật trạng thái vé và đếm ngược giữ chỗ chính xác.

## 🛠 Tech Stack
- **Core:** React 19, Vite, TypeScript.
- **Styling:** Tailwind CSS, Lucide Icons.
- **UI Components:** Radix UI, Ant Design (cho các component phức tạp).
- **State Management:** Zustand.
- **API Client:** Axios.

## 📦 Cài đặt
1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. Cấu hình file `.env.development`:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
3. Khởi chạy:
   ```bash
   npm run dev
   ```

## 🧪 Testing
Sử dụng **Vitest** để kiểm tra các logic xử lý dữ liệu và utility functions.
```bash
npm run test:run
```

---

## 🏗 Cấu trúc thư mục
- `src/components`: Các component dùng chung (Button, Card, Layout...).
- `src/pages`: Các trang chính (Home, Concerts, Admin...).
- `src/lib`: Cấu hình axios, utility functions và định nghĩa theme.
- `src/store`: Quản lý state toàn cục bằng Zustand.
- `src/hooks`: Các custom hooks xử lý logic tái sử dụng.
- `src/assets`: Hình ảnh, font chữ và tài nguyên tĩnh.

---

© 2026 **Melotix Team**.
