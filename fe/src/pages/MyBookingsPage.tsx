import { useEffect, useState } from "react";
import { bookingAPI } from "@/services/api";
import type { Booking } from "@/types";
import {
  fmtDate,
  fmtCurrency,
  fmtCountdown,
  STATUS_CLASS,
  STATUS_LABELS,
} from "@/lib/utils";
import { toast } from "sonner";
import {
  Ticket,
  CreditCard,
  XCircle,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react";
import { Link } from "react-router";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = () => {
    bookingAPI
      .myBookings()
      .then((res) => setBookings(res.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();

    // Auto refresh timer for count downs
    const interval = setInterval(() => {
      setBookings((prev) => [...prev]); // force re-render for countdowns
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

  const handleCancel = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn này?")) return;
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
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vé của tôi</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Quản lý các vé sự kiện bạn đã đặt
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card py-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Ticket className="w-10 h-10 text-foreground/20" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Bạn chưa có đơn đặt vé nào
          </h3>
          <p className="text-foreground/50 mb-6">
            Hãy khám phá các sự kiện đang diễn ra và chọn cho mình một chỗ ngồi
            nhé.
          </p>
          <Link to="/" className="btn-primary">
            Khám phá Sự kiện
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const concert =
              typeof booking.concertId === "object" ? booking.concertId : null;
            const ticket =
              typeof booking.ticketTypeId === "object"
                ? booking.ticketTypeId
                : null;
            const isReserved = booking.status === "RESERVED";

            return (
              <div
                key={booking._id}
                className="glass-card p-6 flex flex-col md:flex-row gap-6 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={STATUS_CLASS[booking.status]}>
                          {STATUS_LABELS[booking.status]}
                        </span>
                        <span className="text-xs text-foreground/30 font-mono">
                          #{booking._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground line-clamp-1">
                        {concert?.name || "Unknown Concert"}
                      </h3>
                      <p className="text-sm text-foreground/60 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {concert ? fmtDate(concert.eventDate) : ""}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-foreground/40 mb-1">Loại vé</p>
                      <p className="font-semibold text-foreground">
                        {ticket?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-1">Số lượng</p>
                      <p className="font-semibold text-foreground">
                        {booking.quantity} vé
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-1">Mã Voucher</p>
                      <p className="font-semibold text-emerald-400">
                        {typeof booking.voucherId === "object" &&
                        booking.voucherId
                          ? booking.voucherId.code
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-1">Tổng tiền</p>
                      <p className="font-bold text-violet-400">
                        {fmtCurrency(booking.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:w-56 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-3">
                  {isReserved ? (
                    <>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center mb-2">
                        <p className="text-xs text-red-300 mb-1 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Hết hạn sau
                        </p>
                        <p className="text-lg font-bold text-red-400 font-mono tracking-wider">
                          {fmtCountdown(booking.expiredAt!)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleConfirmPayment(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="btn-primary flex items-center justify-center gap-2 !py-2.5"
                      >
                        {actionLoading === booking._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                        Thanh toán
                      </button>
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 flex items-center justify-center gap-2 !py-2.5"
                      >
                        <XCircle className="w-4 h-4" /> Hủy đơn
                      </button>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                      {booking.status === "CONFIRMED" ? (
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                          <Ticket className="w-8 h-8 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
                          <XCircle className="w-8 h-8 text-foreground/20" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-foreground">
                        {STATUS_LABELS[booking.status]}
                      </p>
                      {booking.status === "CONFIRMED" && (
                        <p className="text-xs text-foreground/40 mt-1">
                          Sẵn sàng sử dụng
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
