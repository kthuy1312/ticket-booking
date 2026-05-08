import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concert",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true, // VIP / Standard / Early Bird
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    maxPerBooking: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

ticketTypeSchema.index({ concertId: 1 });
ticketTypeSchema.index({ concertId: 1, name: 1 }, { unique: true }); //1 concert không được trùng tên vé

const TicketType = mongoose.model("TicketType", ticketTypeSchema);
export default TicketType;
