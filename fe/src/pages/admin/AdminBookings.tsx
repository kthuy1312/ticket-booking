import { useEffect, useState } from "react";
import { operationAPI } from "@/services/api";
import type { Booking } from "@/types";
import {
  fmtDateTime,
  fmtCurrency,
  STATUS_CLASS,
  STATUS_LABELS,
  cn,
} from "@/lib/utils";
import { toast } from "sonner";
import { Ticket, Loader2, Edit, AlertCircle } from "lucide-react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingLogs, setBookingLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    operationAPI
      .allBookings({ limit: 50 })
      .then((res) => setBookings(res.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchLogs = async (bookingId: string) => {
    setLogsLoading(true);
    try {
      const res = await operationAPI.bookingDetail(bookingId);
      setBookingLogs(res.logs);
    } catch (err) {
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newStatus) return;

    setUpdating(true);
    try {
      await operationAPI.updateBookingStatus(
        selectedBooking._id,
        newStatus,
        reason,
      );
      toast.success("Cập nhật trạng thái thành công");
      setReason("");
      // Refresh current details to see new log
      fetchLogs(selectedBooking._id);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Đặt vé</h1>
          <p className="text-foreground/50 text-sm mt-1">
            Theo dõi và cập nhật trạng thái đặt vé
          </p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/5 border-b border-foreground/10 text-foreground/60 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Mã Đơn</th>
                <th className="p-4 font-semibold">Khách Hàng</th>
                <th className="p-4 font-semibold">Sự kiện / Vé</th>
                <th className="p-4 font-semibold">Tổng Tiền</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              {bookings.map((booking) => {
                const user =
                  typeof booking.userId === "object" ? booking.userId : null;
                const concert =
                  typeof booking.concertId === "object"
                    ? booking.concertId
                    : null;
                const ticket =
                  typeof booking.ticketTypeId === "object"
                    ? booking.ticketTypeId
                    : null;

                return (
                  <tr
                    key={booking._id}
                    className="table-row border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="p-4 font-mono text-sm font-bold text-foreground/70">
                      #{booking._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">
                        {user?.fullName || "N/A"}
                      </div>
                      <div className="text-xs text-foreground/50">
                        {user?.email || ""}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-foreground">
                        {concert?.name || "N/A"}
                      </div>
                      <div className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                        {ticket?.name || "N/A"} x {booking.quantity}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-violet-600 dark:text-violet-400">
                      {fmtCurrency(booking.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={STATUS_CLASS[booking.status]}>
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setNewStatus(booking.status);
                          fetchLogs(booking._id);
                        }}
                        className="btn-ghost !px-3 !py-1.5 text-xs flex items-center gap-2 ml-auto"
                      >
                        <Edit className="w-3 h-3" /> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bookings.length === 0 && !loading && (
            <div className="p-12 text-center text-foreground/30 flex flex-col items-center gap-3">
              <Ticket className="w-12 h-12 opacity-20" />
              <p>Chưa có giao dịch nào được thực hiện.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Chi tiết & Cập nhật Trạng thái */}
      {selectedBooking && (
        <div
          className="modal-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setSelectedBooking(null)
          }
        >
          <div className="modal-content !max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
            <div className="p-6 border-b border-foreground/10 flex justify-between items-center bg-foreground/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Chi tiết đơn hàng
                  </h3>
                  <p className="text-xs text-foreground/50 font-mono">
                    #{selectedBooking._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="modal-close !static !translate-x-0 !translate-y-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Update Status & Info */}
                <div className="space-y-6">
                  <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/10 space-y-3">
                    <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-widest">
                      Thông tin giao dịch
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase">
                          Khách hàng
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {(selectedBooking.userId as any)?.fullName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase">
                          Sự kiện
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {(selectedBooking.concertId as any)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase">
                          Loại vé
                        </p>
                        <p className="text-sm font-semibold text-violet-400">
                          {(selectedBooking.ticketTypeId as any)?.name} x{" "}
                          {selectedBooking.quantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-foreground/40 font-bold uppercase">
                          Thanh toán
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {fmtCurrency(selectedBooking.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateStatus} className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-widest">
                      Cập nhật trạng thái
                    </h4>
                    <div>
                      <label className="block text-xs font-medium text-foreground/70 mb-1 uppercase">
                        Trạng thái mới
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="input-field appearance-none bg-background/50"
                      >
                        {Object.keys(STATUS_LABELS).map((key) => (
                          <option
                            key={key}
                            value={key}
                            className="bg-background text-foreground"
                          >
                            {STATUS_LABELS[key]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-foreground/70 mb-1 uppercase">
                        Lý do thay đổi
                      </label>
                      <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="input-field"
                        placeholder="Nhập lý do..."
                      />
                    </div>

                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-600 dark:text-amber-200/60 leading-tight">
                        Lưu ý: Hủy đơn sẽ tự động hoàn trả số lượng vé vào kho.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        updating || newStatus === selectedBooking.status
                      }
                      className="btn-primary w-full flex justify-center py-3"
                    >
                      {updating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Xác nhận cập nhật"
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Booking Logs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-foreground/50 uppercase tracking-widest flex items-center gap-2">
                    Lịch sử đơn hàng
                    {logsLoading && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                  </h4>

                  <div className="relative space-y-6 before:absolute before:inset-0 before:left-3 before:w-px before:bg-foreground/10">
                    {bookingLogs.length === 0 && !logsLoading && (
                      <p className="text-xs text-foreground/40 italic ml-8">
                        Chưa có lịch sử thay đổi.
                      </p>
                    )}
                    {bookingLogs.map((log, idx) => (
                      <div key={idx} className="relative pl-10 group">
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-background border-2 border-violet-500/50 flex items-center justify-center z-10 group-last:border-violet-500">
                          <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                STATUS_CLASS[log.newStatus],
                              )}
                            >
                              {STATUS_LABELS[log.newStatus]}
                            </span>
                            <span className="text-[10px] text-foreground/30">
                              — {fmtDateTime(log.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/70">
                            {log.reason || "Cập nhật trạng thái"}
                          </p>
                          <p className="text-[10px] text-foreground/40 italic">
                            Thực hiện bởi:{" "}
                            {log.changedBy?.fullName || "Hệ thống"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
