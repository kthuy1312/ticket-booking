import { useEffect, useState } from "react";
import { bookingAPI } from "@/services/api";
import type { Booking } from "@/types";
import {
  fmtDate,
  fmtCurrency,
  fmtCountdown,
  STATUS_CLASS,
  STATUS_LABELS,
  getAssetUrl,
  cn,
} from "@/lib/utils";
import { toast } from "sonner";
import {
  Ticket,
  CreditCard,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Music,
  ExternalLink,
  Download,
  Info,
} from "lucide-react";
import { Link } from "react-router";
import { Modal, QRCode, Divider, Pagination } from "antd";
import type { Pagination as PaginationType } from "@/types";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);

  const fetchBookings = (p = page) => {
    setLoading(true);
    bookingAPI
      .myBookings({ page: p, limit: 10 })
      .then((res) => {
        setBookings(res.bookings);
        setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();

    const interval = setInterval(() => {
      setBookings((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmPayment = async (id: string) => {
    setActionLoading(id);
    try {
      await bookingAPI.confirmPayment(id);
      toast.success("Thanh toán thành công!");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thanh toán");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: "Xác nhận hủy đơn",
      content:
        "Bạn có chắc chắn muốn hủy đơn này? Hành động này không thể hoàn tác.",
      okText: "Xác nhận hủy",
      cancelText: "Quay lại",
      okType: "danger",
      centered: true,
      onOk: async () => {
        setActionLoading(id);
        try {
          await bookingAPI.cancel(id, "Khách hàng tự hủy");
          toast.success("Hủy đơn thành công");
          fetchBookings();
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Lỗi hủy đơn");
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const concertOf = (b: Booking) =>
    typeof b.concertId === "object" ? b.concertId : null;
  const ticketOf = (b: Booking) =>
    typeof b.ticketTypeId === "object" ? b.ticketTypeId : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-foreground/40 font-medium animate-pulse">
          Đang tải vé của bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400 uppercase tracking-widest">
            <Ticket className="w-3 h-3" /> Dashboard
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Vé của tôi
          </h1>
          <p className="text-foreground/50 text-base max-w-md">
            Quản lý và theo dõi trạng thái các vé sự kiện bạn đã đặt tại Melotix
          </p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card !p-4 !rounded-2xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                Tổng đơn
              </p>
              <p className="text-xl font-bold text-foreground">
                {pagination?.total || 0}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card py-24 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping opacity-20" />
            <Ticket className="w-12 h-12 text-foreground/10" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">
            Hành trình âm nhạc đang chờ bạn
          </h3>
          <p className="text-foreground/50 mb-8 max-w-sm">
            Bạn chưa có đơn đặt vé nào. Hãy khám phá các sự kiện bùng nổ nhất và
            chọn cho mình một vị trí tuyệt vời.
          </p>
          <Link
            to="/"
            className="btn-primary flex items-center gap-2 px-8 py-4 !rounded-full shadow-lg shadow-violet-500/20"
          >
            Khám phá Sự kiện ngay <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => {
            const concert = concertOf(booking);
            const ticket = ticketOf(booking);
            const isReserved = booking.status === "RESERVED";
            const isConfirmed = booking.status === "CONFIRMED";

            return (
              <div
                key={booking._id}
                onClick={() => setSelectedBooking(booking)}
                className="group relative flex flex-col lg:flex-row bg-foreground/[0.02] border border-foreground/10 rounded-3xl overflow-hidden hover:border-violet-500/40 hover:bg-foreground/[0.04] transition-all duration-500 shadow-xl cursor-pointer"
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5 z-20",
                    isReserved
                      ? "bg-amber-500"
                      : isConfirmed
                        ? "bg-emerald-500"
                        : "bg-red-500/40",
                  )}
                />

                <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-b from-transparent via-transparent to-black/80 z-10" />
                  {concert?.bannerUrl ? (
                    <img
                      src={getAssetUrl(concert.bannerUrl)}
                      alt={concert.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-violet-900/20 flex items-center justify-center">
                      <Music className="w-12 h-12 text-violet-400/20" />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg backdrop-blur-md",
                        isReserved
                          ? "bg-amber-500 text-white"
                          : isConfirmed
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white",
                      )}
                    >
                      {STATUS_LABELS[booking.status]}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 text-white/70 text-[10px] font-mono backdrop-blur-md border border-white/10">
                      #{booking._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground group-hover:text-violet-500 transition-colors mb-2">
                      {concert?.name || "Unknown Concert"}
                    </h3>
                    <div className="flex flex-wrap gap-y-2 gap-x-6">
                      <p className="text-sm text-foreground/50 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-400" />
                        {concert ? fmtDate(concert.eventDate) : "-"}
                      </p>
                      <p className="text-sm text-foreground/50 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-400" />
                        {concert?.venue || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 p-5 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05]">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        Loại vé
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {ticket?.name || "-"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        Số lượng
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {booking.quantity} vé
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        Voucher
                      </p>
                      <p className="text-sm font-bold text-emerald-500">
                        {typeof booking.voucherId === "object" &&
                        booking.voucherId
                          ? booking.voucherId.code
                          : "-"}
                      </p>
                    </div>
                    <div className="space-y-1 text-right sm:text-left">
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                        Tổng tiền
                      </p>
                      <p className="text-lg font-black text-violet-500 leading-none">
                        {fmtCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="lg:w-64 p-6 lg:p-8 bg-foreground/[0.02] border-t lg:border-t-0 lg:border-l border-foreground/[0.05] flex flex-col justify-center items-center gap-4 relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isReserved ? (
                    <div className="w-full space-y-4 relative z-10">
                      <div className="flex flex-col items-center bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 animate-pulse" /> Giữ chỗ
                          kết thúc sau
                        </p>
                        <p className="text-2xl font-black text-amber-500 font-mono tabular-nums leading-none">
                          {fmtCountdown(booking.expiredAt!)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleConfirmPayment(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="w-full btn-primary flex items-center justify-center gap-2 !py-3 !rounded-xl shadow-lg shadow-violet-600/20"
                        >
                          {actionLoading === booking._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )}
                          <span className="font-bold">Thanh toán ngay</span>
                        </button>
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-foreground/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <XCircle className="w-4 h-4" /> Hủy đơn này
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      {isConfirmed ? (
                        <div className="space-y-4">
                          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)] mx-auto">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-emerald-500">
                              Vé đã xác nhận
                            </p>
                            <p className="text-xs text-foreground/40 mt-1 max-w-[150px]">
                              Bấm để xem mã QR vào cổng
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-20 h-20 rounded-full bg-foreground/5 border border-foreground/10 flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-foreground/20" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground/40">
                              Đơn đã hủy
                            </p>
                            <p className="text-xs text-foreground/30 mt-1">
                              Liên hệ hỗ trợ nếu bạn cần giúp đỡ
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <Ticket className="absolute -bottom-6 -right-6 w-32 h-32 text-foreground/[0.02] -rotate-12 pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination && pagination.total > 0 && (
        <div className="flex justify-center pt-8">
          <Pagination
            current={page}
            total={pagination.total}
            pageSize={pagination.limit}
            onChange={(p) => {
              setPage(p);
              fetchBookings(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            showSizeChanger={false}
            className="glass-card px-4 py-2 border-white/10"
          />
        </div>
      )}

      <Modal
        open={!!selectedBooking}
        onCancel={() => setSelectedBooking(null)}
        footer={null}
        width={420}
        centered
        className="ticket-detail-modal"
      >
        {selectedBooking &&
          (() => {
            const concert = concertOf(selectedBooking);
            const ticket = ticketOf(selectedBooking);
            const isConfirmed = selectedBooking.status === "CONFIRMED";
            const isReserved = selectedBooking.status === "RESERVED";

            return (
              <div className="relative animate-fade-in">
                <div className="absolute -inset-4 bg-violet-600/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative bg-[var(--bg-color)] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col">
                  {/* Compact Banner */}
                  <div className="h-32 relative flex-shrink-0">
                    {concert?.bannerUrl && (
                      <img
                        src={getAssetUrl(concert.bannerUrl)}
                        className="w-full h-full object-cover"
                        alt={concert.name}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-color)] via-[var(--bg-color)]/40 to-transparent" />

                    <div className="absolute top-4 right-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-xl border border-white/10",
                          isConfirmed
                            ? "bg-emerald-500/80 text-white"
                            : isReserved
                              ? "bg-amber-500/80 text-white"
                              : "bg-red-500/80 text-white",
                        )}
                      >
                        {STATUS_LABELS[selectedBooking.status]}
                      </span>
                    </div>
                  </div>

                  {/* Compact Content */}
                  <div className="px-6 pb-6 pt-0 relative">
                    {/* Header - Compact */}
                    <div className="text-center -mt-6 mb-6 relative z-10">
                      <h2 className="text-xl font-black text-foreground tracking-tight leading-tight mb-1 drop-shadow-md">
                        {concert?.name}
                      </h2>
                      <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-widest">
                        ID: #{selectedBooking._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    {/* QR Section - Compact */}
                    <div className="mb-6 relative">
                      <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-color)] border-r border-white/10 z-20" />
                      <div className="absolute -right-[33px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-color)] border-l border-white/10 z-20" />

                      <div className="bg-foreground/[0.02] border border-white/5 rounded-[24px] p-5 flex flex-col items-center justify-center relative overflow-hidden group/qr">
                        {isConfirmed ? (
                          <>
                            <div className="relative p-3 bg-white rounded-xl shadow-lg transition-transform duration-500 group-hover/qr:scale-105">
                              <QRCode
                                value={selectedBooking._id}
                                size={140}
                                bordered={false}
                                color="#000000"
                              />
                            </div>
                            <p className="mt-3 text-emerald-500 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                              <ShieldCheck className="w-3 h-3" /> Cổng soát vé
                            </p>
                          </>
                        ) : (
                          <div className="py-4 flex flex-col items-center gap-3 text-center">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                isReserved
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-red-500/10 text-red-500",
                              )}
                            >
                              {isReserved ? (
                                <Clock className="w-6 h-6" />
                              ) : (
                                <XCircle className="w-6 h-6" />
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-sm font-black",
                                isReserved ? "text-amber-500" : "text-red-500",
                              )}
                            >
                              {isReserved ? "Chờ thanh toán" : "Đã hủy đơn"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info Grid - Streamlined */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-2">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                          Thời gian
                        </p>
                        <p className="text-xs font-bold text-foreground/80">
                          {concert ? fmtDate(concert.eventDate) : "-"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                          Địa điểm
                        </p>
                        <p className="text-xs font-bold text-foreground/80 truncate">
                          {concert?.venue}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                          Hạng vé
                        </p>
                        <p className="text-xs font-bold text-foreground/80">
                          {ticket?.name} x{selectedBooking.quantity}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest">
                          Tổng tiền
                        </p>
                        <p className="text-xs font-black text-violet-500">
                          {fmtCurrency(selectedBooking.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Compact */}
                    <div className="flex gap-3 mt-8">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-[10px] font-bold text-foreground transition-all border border-foreground/5">
                        <Download className="w-3.5 h-3.5 opacity-40" />
                        Lưu ảnh
                      </button>
                      <Link
                        to={`/concerts/${concert?._id}`}
                        className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-[10px] font-bold text-white transition-all shadow-lg shadow-violet-600/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Xem sự kiện
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
