import Concert from "../models/Concert.js";
import TicketType from "../models/TicketType.js";

export const listConcerts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      q,
      month,
      venue,
      sort = "date-asc",
    } = req.query;

    //phân trang, lọc, sort
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { status: "ACTIVE" };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { venue: { $regex: q, $options: "i" } },
      ];
    }

    if (month && month !== "all") {
      const [year, m] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
      filter.eventDate = { $gte: startDate, $lte: endDate };
    }

    if (venue && venue !== "all") {
      filter.venue = venue;
    }

    let sortOption = { eventDate: 1 };
    if (sort === "date-desc") sortOption = { eventDate: -1 };
    if (sort === "name-asc") sortOption = { name: 1 };

    const [concerts, total] = await Promise.all([
      Concert.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v"),
      Concert.countDocuments(filter),
    ]);

    return res.status(200).json({
      concerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
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
    })
      .sort({ sortOrder: 1, price: 1 })
      .select("-__v");

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
    let seatMapImage = "";
    let images = [];

    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
      if (req.files.seatMap && req.files.seatMap[0]) {
        seatMapImage = `/uploads/${req.files.seatMap[0].filename}`;
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
      seatMapImage,
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
    let seatMapImage = concert.seatMapImage;
    let images = concert.images;

    if (req.files) {
      if (req.files.banner && req.files.banner[0]) {
        bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
      if (req.files.seatMap && req.files.seatMap[0]) {
        seatMapImage = `/uploads/${req.files.seatMap[0].filename}`;
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
        seatMapImage,
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

export const getFilterValues = async (req, res) => {
  try {
    //lấy tất cả giá trị venue, dates không trùng nhau
    const venues = await Concert.distinct("venue", { status: "ACTIVE" });
    const dates = await Concert.distinct("eventDate", { status: "ACTIVE" });

    //tạo Set để không bị trùng tháng, dễ gom dlieu theo tháng
    const months = new Set();

    //chuyển từng ngày thành "YYYY-MM"
    dates.forEach((d) => {
      const date = new Date(d);
      months.add(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      );
    });

    return res.status(200).json({
      venues: venues.sort(),
      months: Array.from(months).sort(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
