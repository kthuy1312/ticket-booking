import { useEffect, useState } from 'react';
import { operationAPI } from '@/services/api';
import type { Booking } from '@/types';
import { fmtDateTime, fmtCurrency, STATUS_CLASS, STATUS_LABELS } from '@/lib/utils';
import { toast } from 'sonner';
import { Ticket, Loader2, Edit, AlertCircle } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = () => {
    operationAPI.allBookings({ limit: 50 })
      .then(res => setBookings(res.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newStatus) return;
    
    setUpdating(true);
    try {
      await operationAPI.updateBookingStatus(selectedBooking._id, newStatus, reason);
      toast.success('Cập nhật trạng thái thành công');
      setSelectedBooking(null);
      setReason('');
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
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
    <div className="max-w-6xl mx-auto space-y-8 relative">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Ticket className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Đơn hàng</h1>
          <p className="text-white/50 text-sm mt-1">Quản lý giao dịch và đặt vé</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/60 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Mã Đơn</th>
                <th className="p-4 font-semibold">Khách Hàng</th>
                <th className="p-4 font-semibold">Ngày Tạo</th>
                <th className="p-4 font-semibold">Tổng Tiền</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {bookings.map(booking => {
                const user = typeof booking.userId === 'object' ? booking.userId : null;
                return (
                  <tr key={booking._id} className="table-row">
                    <td className="p-4 font-mono text-sm">{booking._id.slice(-8).toUpperCase()}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{user?.fullName || 'N/A'}</div>
                      <div className="text-xs text-white/50">{user?.email || ''}</div>
                    </td>
                    <td className="p-4 text-sm">{fmtDateTime(booking.createdAt!)}</td>
                    <td className="p-4 font-semibold text-violet-300">{fmtCurrency(booking.totalAmount)}</td>
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
                        }}
                        className="btn-ghost !px-3 !py-1.5 text-xs flex items-center gap-2 ml-auto"
                      >
                        <Edit className="w-3 h-3" /> Cập nhật
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="p-8 text-center text-white/50">Chưa có giao dịch nào.</div>
          )}
        </div>
      </div>

      {/* Modal Cập nhật Trạng thái */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Cập nhật đơn hàng</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-1">
                <span className="text-xs text-white/50">Mã đơn: <span className="font-mono text-white">{selectedBooking._id}</span></span>
                <span className="text-xs text-white/50">Hiện tại: <span className={STATUS_CLASS[selectedBooking.status]}>{STATUS_LABELS[selectedBooking.status]}</span></span>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Trạng thái mới</label>
                <select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)}
                  className="input-field appearance-none bg-black/20"
                >
                  {Object.keys(STATUS_LABELS).map(key => (
                    <option key={key} value={key} className="bg-slate-900 text-white">{STATUS_LABELS[key]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Lý do (Tùy chọn)</label>
                <input 
                  type="text" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className="input-field" 
                  placeholder="Ví dụ: Khách yêu cầu, thanh toán lỗi..."
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mt-4">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200/80">Lưu ý: Hủy hoặc Hết hạn sẽ hoàn lại số lượng vé và lượt sử dụng voucher (nếu có).</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setSelectedBooking(null)} className="btn-ghost flex-1">Hủy</button>
                <button type="submit" disabled={updating || newStatus === selectedBooking.status} className="btn-primary flex-1 flex justify-center">
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
