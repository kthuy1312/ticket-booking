import mongoose from "mongoose";

const concertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    saleStartDate: {
      type: Date,
      required: true,
    },

    saleEndDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ENDED", "CANCELLED"],
      default: "DRAFT",
    },

    bannerUrl: {
      type: String,
      trim: true,
    },

    seatMapImage: {
      type: String,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

concertSchema.index({ status: 1 }); //lọc concert theo trạng thái
concertSchema.index({ eventDate: 1 }); //sắp xếp theo ngày diễn ra
concertSchema.index({ saleStartDate: 1, saleEndDate: 1 }); //check đang mở bán vé hay không

const Concert = mongoose.model("Concert", concertSchema);
export default Concert;
