# Melotix - Modern Concert Booking Platform

**Melotix** là một nền tảng đặt vé concert trực tuyến hiện đại, được tối ưu hóa cho các chiến dịch **Flash Sale** với lưu lượng truy cập lớn. Hệ thống kết hợp trải nghiệm người dùng cao cấp (Luxury SaaS Aesthetic) với các giải pháp kỹ thuật mạnh mẽ để xử lý tranh chấp vé và bảo mật giao dịch.

---

## 💎 Key Features

### Customer Experience

- **Cinematic Discovery:** Khám phá sự kiện với Hero Banner hiệu ứng động, bộ lọc thông minh theo địa điểm và thời gian.
- **Glassmorphic UI:** Giao diện hiện đại, hỗ trợ Light/Dark mode với độ tương phản cao.
- **Robust Reservation:** Giữ chỗ vé trong 15 phút, hỗ trợ áp dụng Voucher thông minh.
- **QR Ticket Management:** Quản lý lịch sử đặt vé và nhận vé điện tử kèm mã QR check-in ngay lập tức.
- **Anti-Overselling:** Cơ chế bảo vệ 3 lớp (Atomic Update, DB Locking, Redis Distributed Lock) đảm bảo không bao giờ bán quá số lượng vé.

### Admin & Operations

- **SaaS Dashboard:** Thống kê doanh thu, tỷ lệ lấp đầy sân vận động và hiệu quả voucher bằng biểu đồ trực quan.
- **Concert Management:** Toàn quyền CRUD concert, hạng vé (Ticket Types) và sơ đồ chỗ ngồi.
- **Voucher Campaign:** Tạo các chiến dịch khuyến mãi với giới hạn số lượt sử dụng và điều kiện áp dụng nghiêm ngặt.
- **Audit Logs:** Theo dõi mọi thay đổi trạng thái của đơn hàng để đối soát và xử lý lỗi/gian lận.

---

## 🛠 Technology Stack

### Backend (Node.js Ecosystem)

- **Framework:** Express.js (ES Modules)
- **Database:** MongoDB with Mongoose (Transaction support)
- **Caching & Concurrency:** Redis (Distributed Locking via ioredis)
- **Documentation:** Swagger UI (OpenAPI 3.0)
- **Validation:** Zod & Mongoose Schema Validation

### Frontend (React Ecosystem)

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Custom Luxury Design System)
- **Components:** Radix UI, Lucide Icons, Shadcn/UI patterns
- **State Management:** Zustand
- **Data Fetching:** Axios

### Testing Tools

- **Backend:** Jest + Supertest + MongoMemoryReplSet
- **Frontend:** Vitest + JSDOM

---

## 📦 Getting Started

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose (để chạy Redis/MongoDB nhanh chóng)

### 1. Infrastructure Setup

Chạy lệnh sau tại thư mục gốc để khởi động Redis và MongoDB:

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd be
npm install
# Tạo file .env từ .env.example và điền thông tin
npm run seed  # Seed dữ liệu mẫu (Admin, Concerts, Vouchers)
npm run dev
```

### 3. Frontend Setup

```bash
cd fe
npm install
npm run dev
```

---

## 🧪 Testing & Quality Assurance

Hệ thống đi kèm với bộ test toàn diện đảm bảo tính đúng đắn của các nghiệp vụ quan trọng.

- **Backend Integration Tests:** Kiểm tra Auth, Concert, và đặc biệt là luồng Booking (bao gồm Transactions & Locking).
  ```bash
  cd be
  npm test
  ```
- **Frontend Unit Tests:** Kiểm tra các logic utility và format dữ liệu.
  ```bash
  cd fe
  npm run test:run
  ```
- **Chi tiết xem tại:** [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)

---

## 📖 Documentation & Architecture

- **Database Schema:** [ERD Diagram](./ERD.png)
- **System Architecture:** [docs/SYSTEM_DESIGN.md](./docs/SYSTEM_DESIGN.md)
- **Assumptions & Scope:** [docs/ASSUMPTIONS.md](./docs/ASSUMPTIONS.md)
- **Postman Collection:** [Online Link](https://www.postman.com/restless-capsule-236537/workspace/lkt/collection/37851469-8083ccca-d3f8-46b0-9639-d4bb69b6e037?action=share&source=copy-link&creator=37851469) | [Local File](./docs/Event%20Ticket%20Booking.postman_collection.json)
- **API Reference:** Truy cập `http://localhost:8080/api-docs` khi server đang chạy.
- **Coding Guidelines:** [docs/CODING_GUIDELINES.md](./docs/CODING_GUIDELINES.md)
- **Local Setup Guide:** [docs/SETUP_GUIDE.md](./docs/SETUP_GUIDE.md)

---

## 🤝 Project Structure

```text
melotix/
├── be/                 # Backend Node.js
│   ├── src/
│   │   ├── controller/ # Logic xử lý request
│   │   ├── libs/       # Cấu hình DB, Redis, Middlewares
│   │   ├── models/     # Mongoose Schemas
│   │   └── routes/     # Định nghĩa API endpoints
│   └── tests/          # Integration Tests
├── fe/                 # Frontend React
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # View layers
│   │   └── store/      # Zustand state management
├── docs/               # System documentation & Postman
└── docker-compose.yml  # Local infrastructure
```

---

© 2026 **Melotix Team**. Built with ❤️ for the music community.
