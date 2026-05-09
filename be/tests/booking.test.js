import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Concert from "../src/models/Concert.js";
import TicketType from "../src/models/TicketType.js";
import Booking from "../src/models/Booking.js";

describe("Booking API", () => {
  let token;
  let concert;
  let ticketType;

  beforeEach(async () => {
    const userRes = await request(app).post("/api/auth/register").send({
      email: "booker@example.com",
      password: "Password123",
      fullName: "Booker User",
    });
    token = userRes.body.token;

    const admin = await User.create({
      email: "admin@example.com",
      passwordHash: "hash",
      fullName: "Admin",
      role: "ADMIN",
    });

    concert = await Concert.create({
      name: "Test Concert",
      venue: "Test Venue",
      eventDate: new Date("2026-12-01"),
      saleStartDate: new Date("2026-01-01"),
      saleEndDate: new Date("2026-12-31"),
      status: "ACTIVE",
      createdBy: admin._id,
    });

    ticketType = await TicketType.create({
      concertId: concert._id,
      name: "Standard",
      price: 1000000,
      totalQuantity: 100,
      availableQuantity: 100,
      maxPerBooking: 4,
    });
  });

  describe("POST /api/bookings", () => {
    it("should create a booking successfully", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send({
          concertId: concert._id,
          ticketTypeId: ticketType._id,
          quantity: 2,
          idempotencyKey: "key-123",
        });

      expect(res.status).toBe(201);
      expect(res.body.booking.quantity).toBe(2);

      const updatedTicket = await TicketType.findById(ticketType._id);
      expect(updatedTicket.availableQuantity).toBe(98);
    });

    it("should handle idempotency", async () => {
      const bookingData = {
        concertId: concert._id,
        ticketTypeId: ticketType._id,
        quantity: 1,
        idempotencyKey: "same-key",
      };

      const res1 = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(bookingData);

      const res2 = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send(bookingData);

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(200);
      expect(res2.body.message).toBe("Booking đã tồn tại");

      const updatedTicket = await TicketType.findById(ticketType._id);
      expect(updatedTicket.availableQuantity).toBe(99);
    });

    it("should fail if quantity exceeds available", async () => {
      await TicketType.findByIdAndUpdate(ticketType._id, {
        availableQuantity: 1,
      });

      const res = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${token}`)
        .send({
          concertId: concert._id,
          ticketTypeId: ticketType._id,
          quantity: 2,
          idempotencyKey: "too-many",
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Vé không đủ. Vui lòng chọn loại vé khác.");
    });
  });
});
