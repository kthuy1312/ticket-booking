import mongoose from "mongoose";

const bookingLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    previousStatus: {
      type: String,
      required: true,
    },

    newStatus: {
      type: String,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

bookingLogSchema.index({ bookingId: 1 });
bookingLogSchema.index({ changedBy: 1 });
bookingLogSchema.index({ createdAt: -1 });

const BookingLog = mongoose.model("BookingLog", bookingLogSchema);
export default BookingLog;
