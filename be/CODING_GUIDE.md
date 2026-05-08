# Coding Guideline & Convention

## 1. Cấu trúc Project

```
src/
├── controller/   ← Business logic
├── routes/       ← Express Router + middleware chaining
├── models/       ← Mongoose schemas
├── middlewares/  ← Auth, role checks
├── jobs/         ← Background tasks
└── libs/         ← DB connection, utilities
```

**Nguyên tắc**: mỗi tầng chỉ làm đúng một việc.  
- Route → chỉ khai báo path + middleware  
- Controller → xử lý request/response + gọi Model  
- Model → định nghĩa schema + index  

---

## 2. Thêm API Mới

### Bước 1 — Tạo handler trong controller

```js
// src/controller/concertController.js
export const myNewHandler = async (req, res) => {
  try {
    // logic
    return res.status(200).json({ data });
  } catch (err) {
    console.error("myNewHandler error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
```

### Bước 2 — Đăng ký route

```js
// src/routes/concertRoute.js
import { myNewHandler } from "../controller/concertController.js";

router.get("/my-path", protectedRoute, myNewHandler);          // USER
router.get("/admin-path", protectedRoute, adminOnly, handler); // ADMIN only
```

### Bước 3 — Cập nhật swagger.json

Thêm path mới vào `src/swagger.json` theo chuẩn OpenAPI 3.0.

---

## 3. Auth & Phân quyền

```js
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { adminOnly }      from "../middlewares/adminMiddleware.js";

router.get("/public-route", handler);                          // public
router.get("/user-route",   protectedRoute, handler);          // USER + ADMIN
router.get("/admin-route",  protectedRoute, adminOnly, handler); // ADMIN only
```

Sau `protectedRoute`, dùng `req.user` để lấy thông tin user:
```js
req.user._id    // ObjectId
req.user.role   // "USER" | "ADMIN"
req.user.email
```

---

## 4. MongoDB Transactions (quan trọng)

Dùng transactions khi có **nhiều collection cần update atomically** (vd: booking + ticketType + voucher).

```js
const session = await mongoose.startSession();
session.startTransaction();
try {
  const doc = await MyModel.findOneAndUpdate(
    { condition },
    { $inc: { field: -1 } },
    { new: true, session }        // ← luôn truyền session
  );
  if (!doc) {
    await session.abortTransaction();
    session.endSession();
    return res.status(409).json({ message: "..." });
  }
  await session.commitTransaction();
  session.endSession();
} catch (err) {
  await session.abortTransaction();
  session.endSession();
  throw err;
}
```

---

## 5. Response Format

| Trường hợp | Status | Body |
|---|---|---|
| Thành công (lấy data) | 200 | `{ data }` hoặc `{ items, pagination }` |
| Tạo mới | 201 | `{ message, <resource> }` |
| Idempotent | 200 | `{ message: "... (idempotent response)", <resource> }` |
| Bad Request | 400 | `{ message: "..." }` |
| Unauthorized | 401 | `{ message: "..." }` |
| Forbidden | 403 | `{ message: "Forbidden: Admins only" }` |
| Not Found | 404 | `{ message: "..." }` |
| Conflict | 409 | `{ message: "..." }` |
| Server Error | 500 | `{ message: "Lỗi server" }` |

---

## 6. Pagination

```js
const { page = 1, limit = 20 } = req.query;
const skip = (parseInt(page) - 1) * parseInt(limit);

const [items, total] = await Promise.all([
  Model.find(filter).skip(skip).limit(parseInt(limit)),
  Model.countDocuments(filter),
]);

return res.json({
  items,
  pagination: { page: +page, limit: +limit, total, totalPages: Math.ceil(total / limit) },
});
```

---

## 7. Thêm Model Mới

```js
// src/models/MyModel.js
import mongoose from "mongoose";

const mySchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
  },
  { timestamps: true }
);

mySchema.index({ field: 1 });

const MyModel = mongoose.model("MyModel", mySchema);
export default MyModel;
```

---

## 8. Naming Convention

| Loại | Convention | Ví dụ |
|---|---|---|
| File | camelCase | `bookingController.js` |
| Function | camelCase | `createBooking` |
| Model | PascalCase | `Booking`, `TicketType` |
| Route path | kebab-case | `/ticket-types`, `/confirm-payment` |
| Env var | UPPER_SNAKE | `MONGO_URI`, `SECRET` |
| Enum value | UPPER_SNAKE | `"WAITING_PAYMENT"`, `"EARLY_BIRD"` |

---

## 9. Logging

Dùng `console.error` cho lỗi trong catch block (kèm context):
```js
console.error("createBooking error:", err);
```

---

## 10. Chạy Unit Test (hướng dẫn thiết lập)

Hiện tại chưa có test runner. Để thêm:

```bash
npm install --save-dev jest @jest/globals
```

Thêm vào `package.json`:
```json
"scripts": {
  "test": "node --experimental-vm-modules node_modules/.bin/jest"
},
"jest": { "transform": {} }
```

Tạo file test:
```js
// src/__tests__/booking.test.js
import { describe, it, expect } from "@jest/globals";

describe("Booking", () => {
  it("should calculate discount correctly", () => {
    const price = 1_500_000;
    const qty = 2;
    const discount = Math.round(price * qty * 0.1);
    expect(discount).toBe(300_000);
  });
});
```

Chạy:
```bash
npm test
```
