import Concert from "../models/Concert.js";
import TicketType from "../models/TicketType.js";

export const listConcerts = async (req, res) => {
  try {
    const concerts = await Concert.find({ status: "ACTIVE" })
      .sort({ eventDate: 1 })
      .select("-__v");

    return res.status(200).json({ concerts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getConcert = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).select("-__v");
    if (!concert) {
      return res.status(404).json({ message: "Concert không tồn tại" });
    }

    return res.status(200).json({ concert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//danh sách ticket types của concert
export const getTicketTypes = async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      return res.status(404).json({ message: "Concert không tồn tại" });
    }

    const ticketTypes = await TicketType.find({
      concertId: req.params.id,
    }).select("-__v");

    return res.status(200).json({ ticketTypes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//admin
export const createConcert = async (req, res) => {
  try {
    const { name, description, venue, eventDate, saleStartDate, saleEndDate } =
      req.body;

    // Xử lý files từ multer
    let bannerUrl = "";
    let images = [];

    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
      if (req.files.images) {
        images = req.files.images.map((f) => `/uploads/${f.filename}`);
      }
    }

    if (!name || !venue || !eventDate || !saleStartDate || !saleEndDate) {
      return res.status(400).json({
        message:
          "name, venue, eventDate, saleStartDate, saleEndDate là bắt buộc",
      });
    }

    if (new Date(saleStartDate) >= new Date(saleEndDate)) {
      return res
        .status(400)
        .json({ message: "saleStartDate phải trước saleEndDate" });
    }

    const concert = await Concert.create({
      name,
      description,
      venue,
      eventDate: new Date(eventDate),
      saleStartDate: new Date(saleStartDate),
      saleEndDate: new Date(saleEndDate),
      bannerUrl,
      images,
      status: "DRAFT",
      createdBy: req.user._id,
    });

    return res.status(201).json({ message: "Tạo concert thành công", concert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateConcert = async (req, res) => {
  try {
    const { name, description, venue, eventDate, saleStartDate, saleEndDate } =
      req.body;

    const concert = await Concert.findById(req.params.id);
    if (!concert) {
      return res.status(404).json({ message: "Concert không tồn tại" });
    }

    //xlyfiles từ multer
    let bannerUrl = concert.bannerUrl;
    let images = concert.images;

    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
      if (req.files.images && req.files.images.length > 0) {
        images = req.files.images.map((f) => `/uploads/${f.filename}`);
      }
    }

    const updated = await Concert.findByIdAndUpdate(
      req.params.id,
      {
        name: name || concert.name,
        description:
          description !== undefined ? description : concert.description,
        venue: venue || concert.venue,
        eventDate: eventDate ? new Date(eventDate) : concert.eventDate,
        saleStartDate: saleStartDate
          ? new Date(saleStartDate)
          : concert.saleStartDate,
        saleEndDate: saleEndDate ? new Date(saleEndDate) : concert.saleEndDate,
        bannerUrl,
        images,
      },
      { new: true },
    );

    return res
      .status(200)
      .json({ message: "Cập nhật thành công", concert: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const updateConcertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ["DRAFT", "ACTIVE", "ENDED", "CANCELLED"];

    if (!status || !VALID.includes(status)) {
      return res
        .status(400)
        .json({ message: `status phải là một trong: ${VALID.join(", ")}` });
    }

    const concert = await Concert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!concert) {
      return res.status(404).json({ message: "Concert không tồn tại" });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công", concert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
